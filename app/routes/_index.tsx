import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
type HarrabMoney = {
  amount: string;
  currencyCode: 'CAD';
};

type HarrabImage = {
  __typename?: 'Image';
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

type HarrabVariant = {
  id: string;
  availableForSale: boolean;
  image: HarrabImage;
  price: HarrabMoney;
  product: {
    title: string;
    handle: string;
  };
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  sku: string | null;
  title: string;
  unitPrice: HarrabMoney | null;
};

type HarrabProduct = {
  id: string;
  title: string;
  handle: string;
  variants: {
    nodes: HarrabVariant[];
  };
  priceRange: {
    minVariantPrice: HarrabMoney;
  };
  featuredImage: HarrabImage;
};

type HarrabProducts = {
  products: {
    nodes: HarrabProduct[];
  };
};
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'HARRAB | Dark Martial Arts Clothing'},
    {
      name: 'description',
      content:
        'Dark martial arts clothing forged for harder training and no retreat.',
    },
  ];
};

export async function loader() {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData();

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData();

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData() {
  return {
    recommendedProducts: MOCK_RECOMMENDED_PRODUCTS,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData() {
  return {
    collections: Promise.resolve(MOCK_COLLECTIONS),
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="harrab-home">
      <Hero />
      <RecommendedProducts products={data.recommendedProducts} />
      <TrainingStatement />
      <CollectionsStrip collections={data.collections} />
      <Marquee />
    </div>
  );
}

function Hero() {
  const letters = 'HARRAB'.split('');

  return (
    <section className="harrab-hero" aria-labelledby="harrab-title">
      <motion.p
        className="harrab-kicker"
        initial={{opacity: 0, y: 18}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.7, ease: 'easeOut'}}
      >
        Dark martial arts clothing
      </motion.p>
      <motion.h1
        id="harrab-title"
        className="harrab-title"
        aria-label="Harrab"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.085,
              delayChildren: 0.15,
            },
          },
        }}
      >
        {letters.map((letter, index) => (
          <motion.span
            aria-hidden="true"
            key={`${letter}-${index}`}
            variants={{
              hidden: {opacity: 0, y: 96, rotateX: -70},
              show: {opacity: 1, y: 0, rotateX: 0},
            }}
            transition={{duration: 0.72, ease: [0.16, 1, 0.3, 1]}}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>
      <motion.div
        className="harrab-hero-copy"
        initial={{opacity: 0, y: 18}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.7, delay: 0.8, ease: 'easeOut'}}
      >
        <p>
          Built for clinch rounds, bag work, road miles, and the walk back in
          when every muscle tells you to quit.
        </p>
        <Link to="/collections/all" className="harrab-cta">
          Shop the mock drop
        </Link>
      </motion.div>
    </section>
  );
}

function RecommendedProducts({
  products,
}: {
  products: HarrabProducts | null;
}) {
  const nodes = products?.products.nodes ?? [];

  return (
    <section className="harrab-products" aria-labelledby="harrab-products">
      <div className="harrab-section-heading">
        <p>Mock.shop inventory</p>
        <h2 id="harrab-products">Fightwear in rotation</h2>
      </div>
      <div className="harrab-product-grid">
        {nodes.map((product, index) => (
          <HarrabProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}

function HarrabProductCard({
  product,
  index,
}: {
  product: HarrabProduct;
  index: number;
}) {
  const image = product.featuredImage;
  const selectedVariant = product.variants?.nodes?.[0];
  const {open} = useAside();

  return (
    <motion.article
      className="harrab-product-card"
      initial={{opacity: 0, y: 44}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.28}}
      transition={{duration: 0.62, delay: Math.min(index * 0.06, 0.3)}}
      whileHover={{
        y: -10,
        boxShadow: '0 0 40px rgba(230, 57, 70, 0.42)',
      }}
    >
      {image && (
        <Link to={`/products/${product.handle}`} prefetch="intent">
          <Image
            className="harrab-product-image"
            data={image}
            aspectRatio="1/1"
            sizes="(min-width: 64em) 33vw, (min-width: 45em) 50vw, 100vw"
            alt={image.altText || product.title}
          />
        </Link>
      )}
      <div className="harrab-product-copy">
        <Link to={`/products/${product.handle}`} prefetch="intent">
          <h3>{product.title}</h3>
        </Link>
        <Money data={product.priceRange.minVariantPrice} />
      </div>
      <AddToCartButton
        disabled={!selectedVariant?.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </motion.article>
  );
}

function TrainingStatement() {
  return (
    <section className="harrab-statement">
      <p>Molten red details. Off-white grit. Black until the round ends.</p>
      <span>Sharp gear for sharp work.</span>
    </section>
  );
}

function CollectionsStrip({
  collections,
}: {
  collections: Promise<{collections: {nodes: Array<{id: string; title: string; handle: string}>}} | null>;
}) {
  return (
    <Suspense fallback={null}>
      <Await resolve={collections}>
        {(response) =>
          response ? (
            <section className="harrab-collections" aria-label="Collections">
              {response.collections.nodes.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.handle}`}>
                  {collection.title}
                </Link>
              ))}
            </section>
          ) : null
        }
      </Await>
    </Suspense>
  );
}

function Marquee() {
  const phrase = 'TRAIN HARDER · BLEED LESS · WEAR HARRAB · NO RETREAT';

  return (
    <section className="harrab-marquee" aria-label={phrase}>
      <div>
        {Array.from({length: 6}).map((_, index) => (
          <span key={index}>{phrase}</span>
        ))}
      </div>
    </section>
  );
}

const MOCK_RECOMMENDED_PRODUCTS = {
  products: {
    nodes: [
      {
        id: 'gid://shopify/Product/7983595487254',
        title: 'High Top Sneakers',
        handle: 'high-top-sneakers',
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/43696963387414',
              availableForSale: true,
              image: {
                __typename: 'Image',
                id: 'gid://shopify/ProductImage/39774608883734',
                url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Whiteleathersneakers01.jpg?v=1675447604',
                altText: null,
                width: 4096,
                height: 4096,
              },
              price: {amount: '180.0', currencyCode: 'CAD'},
              product: {title: 'High Top Sneakers', handle: 'high-top-sneakers'},
              selectedOptions: [{name: 'Size', value: '6'}],
              sku: '',
              title: '6',
              unitPrice: null,
            },
          ],
        },
        priceRange: {minVariantPrice: {amount: '180.0', currencyCode: 'CAD'}},
        featuredImage: {
          id: 'gid://shopify/ProductImage/39774608883734',
          url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Whiteleathersneakers01.jpg?v=1675447604',
          altText: null,
          width: 4096,
          height: 4096,
        },
      },
      {
        id: 'gid://shopify/Product/7983602040854',
        title: 'Beanie',
        handle: 'beanie',
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/43696949592086',
              availableForSale: true,
              image: {
                __typename: 'Image',
                id: 'gid://shopify/ProductImage/39774611636246',
                url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/GreenHat01_e925fadd-05dc-4185-b7fe-482f9c0e49b2.jpg?v=1675454374',
                altText: null,
                width: 4096,
                height: 4096,
              },
              price: {amount: '100.0', currencyCode: 'CAD'},
              product: {title: 'Beanie', handle: 'beanie'},
              selectedOptions: [{name: 'Color', value: 'Green'}],
              sku: null,
              title: 'Green',
              unitPrice: null,
            },
          ],
        },
        priceRange: {minVariantPrice: {amount: '100.0', currencyCode: 'CAD'}},
        featuredImage: {
          id: 'gid://shopify/ProductImage/39774611636246',
          url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/GreenHat01_e925fadd-05dc-4185-b7fe-482f9c0e49b2.jpg?v=1675454374',
          altText: null,
          width: 4096,
          height: 4096,
        },
      },
      {
        id: 'gid://shopify/Product/7983595388950',
        title: 'Gray Runners',
        handle: 'gray-runners',
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/43696961749014',
              availableForSale: true,
              image: {
                __typename: 'Image',
                id: 'gid://shopify/ProductImage/39774608818198',
                url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Greyrunners.jpg?v=1675447483',
                altText: null,
                width: 4096,
                height: 4096,
              },
              price: {amount: '30.0', currencyCode: 'CAD'},
              product: {title: 'Gray Runners', handle: 'gray-runners'},
              selectedOptions: [{name: 'Size', value: '4'}],
              sku: '',
              title: '4',
              unitPrice: null,
            },
          ],
        },
        priceRange: {minVariantPrice: {amount: '30.0', currencyCode: 'CAD'}},
        featuredImage: {
          id: 'gid://shopify/ProductImage/39774608818198',
          url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Greyrunners.jpg?v=1675447483',
          altText: null,
          width: 4096,
          height: 4096,
        },
      },
    ],
  },
} satisfies HarrabProducts;

const MOCK_COLLECTIONS = {
  collections: {
    nodes: [
      {id: 'gid://shopify/Collection/mock-1', title: 'Training', handle: 'training'},
      {id: 'gid://shopify/Collection/mock-2', title: 'Recovery', handle: 'recovery'},
      {id: 'gid://shopify/Collection/mock-3', title: 'No Retreat', handle: 'no-retreat'},
    ],
  },
};
