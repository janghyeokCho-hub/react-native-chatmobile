export const ACTIVE = "#fdcf2f";
export const DISABLED =  "#999";

export function getActiveColor(flag) {
    return flag ? ACTIVE : DISABLED;
}