import {useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN ?? 'mock.shop',
    shop: {
      shopId: 'gid://shopify/Shop/mock',
      acceptedLanguage: args.context.storefront.i18n.language,
      currency: 'CAD',
      hydrogenSubchannelId: env.PUBLIC_STOREFRONT_ID ?? '0',
    },
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN ?? 'checkout.mock.shop',
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN ?? '',
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const liveStorefront = shouldUseLiveStorefront(context.env.PUBLIC_STORE_DOMAIN);
  const [header] = await Promise.all([
    liveStorefront
      ? (context.storefront.query(HEADER_QUERY, {
          cache: context.storefront.CacheLong(),
          variables: {
            headerMenuHandle: 'main-menu',
          },
        }) as Promise<HeaderQuery>).catch(() => createFallbackHeader())
      : createFallbackHeader(),
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const liveStorefront = shouldUseLiveStorefront(context.env.PUBLIC_STORE_DOMAIN);
  const footer = liveStorefront
    ? (context.storefront.query(FOOTER_QUERY, {
        cache: context.storefront.CacheLong(),
        variables: {
          footerMenuHandle: 'footer',
        },
      }) as Promise<FooterQuery>).catch(() => createFallbackFooter())
    : Promise.resolve(createFallbackFooter());

  return {
    cart: context.cart.get().catch(() => null),
    isLoggedIn: context.customerAccount.isLoggedIn().catch(() => false),
    footer,
  };
}

function shouldUseLiveStorefront(storeDomain?: string) {
  return Boolean(storeDomain && storeDomain !== 'mock.shop');
}

function createFallbackHeader(): HeaderQuery {
  return {
    shop: {
      id: 'gid://shopify/Shop/mock',
      name: 'HARRAB',
      description: 'Dark martial arts clothing',
      primaryDomain: {
        url: 'https://mock.shop',
      },
      brand: {
        logo: null,
      },
    },
    menu: null,
  };
}

function createFallbackFooter(): FooterQuery {
  return {
    menu: {
      id: 'gid://shopify/Menu/harrab-footer',
      items: [
        {
          id: 'gid://shopify/MenuItem/harrab-training',
          resourceId: null,
          tags: [],
          title: 'Training',
          type: 'HTTP',
          url: '/collections/training',
          items: [],
        },
        {
          id: 'gid://shopify/MenuItem/harrab-recovery',
          resourceId: null,
          tags: [],
          title: 'Recovery',
          type: 'HTTP',
          url: '/collections/recovery',
          items: [],
        },
        {
          id: 'gid://shopify/MenuItem/harrab-no-retreat',
          resourceId: null,
          tags: [],
          title: 'No Retreat',
          type: 'HTTP',
          url: '/collections/no-retreat',
          items: [],
        },
      ],
    },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <PageLayout {...data}>
      <Outlet />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
