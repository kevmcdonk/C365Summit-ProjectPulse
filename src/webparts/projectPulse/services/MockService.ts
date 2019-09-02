import { IPulseItem } from '../interfaces/IPulseItem';

export default class MockService  {

    private static _items: IPulseItem[] = [{ Title: 'Meh', Id: 1 },
                                        { Title: 'Meh', Id: 2 },
                                        { Title: 'Sad', Id: 3 }];
    
    public static get(): Promise<IPulseItem[]> {
    return new Promise<IPulseItem[]>((resolve) => {
            resolve(MockService._items);
        });
    }

    public static add(listItemEntityTypeName:string, feeling: string): void {
        this._items.push({ Title: feeling, Id: this._items.length+1 });    
    }

    public static getEntityTypeName(): Promise<string> {
        return new Promise<string>((resolve: (listItemEntityTypeName: string) => void, reject: (error: any) => void): void => {
            resolve('SP.ListItem');
            return;
          });
    }
}