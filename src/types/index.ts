export enum CardType {
    MONTHLY = 1,        // 月卡
    SEASON = 2,         // 季卡
    HALF_YEAR = 3,      // 半年卡
    PRIVATE = 4,        // 私教次卡
    FASCIA = 5          // 筋膜康复次卡
}

export const CardTypeName: Record<CardType, string> = {
    [CardType.MONTHLY]: '月卡',
    [CardType.SEASON]: '季卡',
    [CardType.HALF_YEAR]: '半年卡',
    [CardType.PRIVATE]: '私教次卡',
    [CardType.FASCIA]: '筋膜康复次卡'
};