import { IPulseItem } from '../interfaces/IPulseItem';
import { IPulseItems } from '../interfaces/IPulseItems';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export default class SPService  {

    
    public static get(spHttpClient: SPHttpClient, siteUrl: string, listName: string): Promise<IPulseItem[]> {
      let responseItems: IPulseItem[] = [];
      return new Promise<IPulseItem[]>((resolve: (responseItems: IPulseItem[]) => void, reject: (error: any) => void): void => {
        spHttpClient.get(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse): Promise<{ ResponseItems: IPulseItems }> => {
          return response.json();
        }, (error: any): void => {
          reject(error);
        })
        .then((response: any ): void => {
          responseItems = response.value;
          resolve(responseItems);
        });
      });

      
    }

    public static add(listItemEntityTypeName: string, feeling: string, spHttpClient: SPHttpClient, siteUrl: string, listName: string):void {
      const body: string = JSON.stringify({
        '__metadata': {
          'type': listItemEntityTypeName
        },
        'Title': feeling
      });


      spHttpClient.post(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-type': 'application/json;odata=verbose',
            'odata-version': ''
          },
          body: body
        });
    }

    public static getEntityTypeName(listItemEntityTypeName: string, spHttpClient: SPHttpClient, siteUrl: string, listName: string): Promise<string> {
        return new Promise<string>((resolve: (listItemEntityTypeName: string) => void, reject: (error: any) => void): void => {
            if (listItemEntityTypeName) {
              resolve(listItemEntityTypeName);
              return;
            }
    
            spHttpClient.get(`${siteUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`,
              SPHttpClient.configurations.v1,
              {
                headers: {
                  'Accept': 'application/json;odata=nometadata',
                  'odata-version': ''
                }
              })
              .then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
                return response.json();
              }, (error: any): void => {
                reject(error);
              })
              .then((response: { ListItemEntityTypeFullName: string }): void => {
                listItemEntityTypeName = response.ListItemEntityTypeFullName;
                resolve(listItemEntityTypeName);
              });
          });
    }
}