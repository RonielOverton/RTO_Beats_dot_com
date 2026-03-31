import { albumType, orderType, productType } from "./documents";
import { checkoutLinksType, creditType, productPriceType, streamingLinksType, trackType } from "./objects";

export const schemaTypes = [
	albumType,
	productType,
	orderType,
	trackType,
	streamingLinksType,
	creditType,
	productPriceType,
	checkoutLinksType,
];
