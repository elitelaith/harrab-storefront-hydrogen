const HARRAB_MOCK_PRODUCTS = [
  {
    id: 'gid://shopify/Product/7983595487254',
    title: 'High Top Sneakers',
    handle: 'high-top-sneakers',
    featuredImage: {
      id: 'gid://shopify/ProductImage/39774608883734',
      url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Whiteleathersneakers01.jpg?v=1675447604',
      altText: null,
      width: 4096,
      height: 4096,
    },
    priceRange: {
      minVariantPrice: {amount: '180.0', currencyCode: 'CAD'},
      maxVariantPrice: {amount: '180.0', currencyCode: 'CAD'},
    },
  },
  {
    id: 'gid://shopify/Product/7983602040854',
    title: 'Beanie',
    handle: 'beanie',
    featuredImage: {
      id: 'gid://shopify/ProductImage/39774611636246',
      url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/GreenHat01_e925fadd-05dc-4185-b7fe-482f9c0e49b2.jpg?v=1675454374',
      altText: null,
      width: 4096,
      height: 4096,
    },
    priceRange: {
      minVariantPrice: {amount: '100.0', currencyCode: 'CAD'},
      maxVariantPrice: {amount: '100.0', currencyCode: 'CAD'},
    },
  },
  {
    id: 'gid://shopify/Product/7983595388950',
    title: 'Gray Runners',
    handle: 'gray-runners',
    featuredImage: {
      id: 'gid://shopify/ProductImage/39774608818198',
      url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/products/Greyrunners.jpg?v=1675447483',
      altText: null,
      width: 4096,
      height: 4096,
    },
    priceRange: {
      minVariantPrice: {amount: '30.0', currencyCode: 'CAD'},
      maxVariantPrice: {amount: '30.0', currencyCode: 'CAD'},
    },
  },
] as const;

const COLLECTION_LABELS: Record<string, {title: string; description: string}> = {
  training: {
    title: 'Training',
    description: 'Dark mock.shop gear selected for hard rounds and road work.',
  },
  recovery: {
    title: 'Recovery',
    description: 'Off-mat essentials for reset days and cold walks home.',
  },
  'no-retreat': {
    title: 'No Retreat',
    description: 'Sharp pieces for showing up when the room gets heavy.',
  },
};

export function shouldUseLiveStorefront(storeDomain?: string) {
  return Boolean(storeDomain && storeDomain !== 'mock.shop');
}

export function createMockProductsConnection() {
  return {
    nodes: HARRAB_MOCK_PRODUCTS.map((product) => ({...product})),
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
}

export function createMockCollection(handle: string) {
  const label = COLLECTION_LABELS[handle] ?? {
    title: handle === 'all' ? 'Products' : handle.replaceAll('-', ' '),
    description: 'Mock.shop Harrab storefront collection for local development.',
  };

  return {
    id: `gid://shopify/Collection/harrab-${handle}`,
    handle,
    title: label.title,
    description: label.description,
    products: createMockProductsConnection(),
  };
}