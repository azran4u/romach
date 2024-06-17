export interface BaseCategory {
  id: string;
  name: string;
}
export interface Category extends BaseCategory {
  children: Category[];
}
