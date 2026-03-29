import type { CartLine, StoreItem } from "@/types/content";

export function createCartLine(item: StoreItem, quantity = 1): CartLine {
  return {
    itemId: item.id,
    slug: item.slug,
    title: item.title,
    kind: item.kind,
    unitPrice: item.price,
    quantity,
    image: item.image,
  };
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
