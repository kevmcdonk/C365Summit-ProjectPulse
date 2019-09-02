import { SPHttpClient } from '@microsoft/sp-http';

export interface IPulseProps {
  description: string;
  listName: string;
  spHttpClient: SPHttpClient;
  siteUrl: string;
  backgroundColor: string;
}