// "12,50 €", as prices are written in Croatia.
export const formatPrice = (value: number) =>
    value.toLocaleString("hr-HR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
