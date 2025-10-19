import { SectionItem } from "./section-item.model";

export interface SectionView {
    id: string;
    date: Date;
    items: SectionItem[]
}