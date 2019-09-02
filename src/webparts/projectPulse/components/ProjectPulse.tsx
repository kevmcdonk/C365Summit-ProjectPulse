import * as React from 'react';
import styles from './ProjectPulse.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import MockService from '../services/MockService';
import SPService from '../services/SPService';
import {
  Environment,
  EnvironmentType
} from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IPulseItem } from '../interfaces/IPulseItem';
import { IPulseItems } from '../interfaces/IPulseItems';
import { IPulseProps } from '../interfaces/IPulseProps';
import { IPulseState } from '../interfaces/IPulseState';

export default class ProjectPulse extends React.Component<IPulseProps, IPulseState> {
  private listItemEntityTypeName: string = undefined;
  private tempStyle: any = undefined;
  private bgStyle: any = undefined;
  private localStorageKeyLastDate: string = 'ProjectPulseLastDate';

  constructor(props: IPulseProps) {
    super(props);

    var lastPulseTimeText = localStorage.getItem(this.localStorageKeyLastDate);
    let showPulses:boolean = false;
    if (lastPulseTimeText == null) {
      showPulses = true;
    }
    else {
      var currentDate = new Date();
      var lastPulseTime = new Date(lastPulseTimeText);
      if (lastPulseTime.getDate() != currentDate.getDate()
       || lastPulseTime.getMonth() != currentDate.getMonth()
       || lastPulseTime.getFullYear() != currentDate.getFullYear()) {
         showPulses = true;
       }
    }
    //milliseconds in a day86400000
    if (showPulses)
    {
        this.state = {
        status: 'getPulse',
        items: [],
        showPulses: true,
        showLoading: false,
        showTemperature: false,
        temperature: 0,
        happyCount: 0,
        mehCount: 0,
        sadCount:0,
        pulseText: ''
      };
    }
    else {
      this.state = {
        status: 'getPulse',
        items: [],
        showPulses: false,
        showLoading: true,
        showTemperature: false,
        temperature: 0,
        happyCount: 0,
        mehCount: 0,
        sadCount:0,
        pulseText: ''
      };
      this.showTemperature();
    }

    this.tempStyle = {
      background: '-webkit-linear-gradient(top, #fff 0%, #fff ' + this.state.temperature + '%, #db3f02 ' + this.state.temperature + '%, #db3f02 100%)'
    };

    this.bgStyle = {
      backgroundColor: this.props.backgroundColor
    };
  }

  public render(): React.ReactElement<IPulseProps> {
    
    return (
      <div className={styles.projectPulse}>
      <div className={styles.container}>

        {this.state.showPulses &&
          <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`} style={this.bgStyle}>
            <div className="ms-Grid-col ms-u-lg12">
              <span className="ms-font-xl ms-fontColor-white">How do you feel today?</span>
            </div>
            <div className="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white">
              <div onClick={() => this.createItem('Happy')} role="button" className={`ms-Grid-col ms-u-lg4 ms-font-su ${styles.feelingIcon}`}>
                <Icon iconName='Emoji2' className={styles.pulseIcon}/>
              </div>
              <div onClick={() => this.createItem('Meh')} role="button" className={`ms-Grid-col ms-u-lg4 ms-font-su ${styles.feelingIcon}`}>
                <Icon iconName='EmojiNeutral' className={styles.pulseIcon}/>
              </div>
              <div onClick={() => this.createItem('Sad')} role="button" className={`ms-Grid-col ms-u-lg4 ms-font-su ${styles.feelingIcon}`}>
                <Icon iconName='Sad' className={styles.pulseIcon}/>

              </div>
            </div>
          </div>
        }
        {this.state.showLoading &&

          <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`} style={this.bgStyle}>
            <div className="ms-Grid-col ms-u-lg12">
              <span className="ms-font-xl ms-fontColor-white">Loading...</span>
            </div>
            <div className="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white">
              <div className={`ms-Grid-col ms-u-lg4 ms-font-su ${styles.feelingIcon}`}>
                <i className="ms-Icon ms-Icon--Sync"></i>
              </div>
            </div>
          </div>
        }
        {this.state.showTemperature &&

          <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}`} style={this.bgStyle}>
            <div className="ms-Grid-col ms-u-lg12">
              <span className="ms-font-xl ms-fontColor-white">{this.props.description}</span>
            </div>
            <div className={`ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.thermometerContainer}`}>
              <div className={`ms-Grid-col ms-u-lg6 ms-u-sm6 ms-font-su ${styles.feelingIcon}`}>
                <span className={styles.thermometer} style={this.tempStyle}>{this.state.temperature}%</span>
              </div>
              
            </div>
          </div>
        }
      </div>
    </div>
    );
  }

  private showTemperature() {
    if (Environment.type === EnvironmentType.Local) {
          MockService.get().then((response) => {
            //this._renderList(response.value);
            var score = 0;
            var happyScore = 0;
            var mehScore = 0;
            var sadScore = 0;
            var pulseText = '';
            
            for (let pulse of response) {
              //pulseText += '*' + pulse.Title;
              if (pulse.Title == 'Happy') {
                score += 1;
                happyScore += 1;
              }
              else if (pulse.Title == 'Meh') {
                score += 0.5;
                mehScore += 1;
              }
              else if (pulse.Title == 'Sad') {
                sadScore += 1;
              }
            }

            var tempPercentage = Number((100 - ((score / response.length) * 100)).toFixed(2));
            this.tempStyle = {
              background: '-webkit-linear-gradient(top, #fff 0%, #fff ' + tempPercentage + '%, #db3f02 ' + tempPercentage + '%, #db3f02 100%)'
            };
            this.setState({
              status: 'showTemperature',
              items: [],
              showPulses: false,
              showLoading: false,
              showTemperature: true,
              temperature: Number(((score / response.length) * 100).toFixed(2)),
              happyCount: happyScore,
              mehCount: mehScore,
              sadCount: sadScore,
              pulseText: pulseText
            });
          });
        }
        else if (Environment.type == EnvironmentType.SharePoint ||
          Environment.type == EnvironmentType.ClassicSharePoint) {

          this._getTodayPulses().then((pulses: IPulseItem[]): Promise<IPulseItem[]> => {

            let score: number = 0;
            var happyScore = 0;
            var mehScore = 0;
            var sadScore = 0;
            var pulseText = '';

            pulses.forEach((pulse: IPulseItem) => {
              //pulseText += '*' + pulse.Title;
              if (pulse.Title == 'Happy') {
                score += 1;
                happyScore += 1;
              }
              else if (pulse.Title == 'Meh') {
                score += 0.5;
                mehScore += 1;
              }
              else {
                sadScore += 1;
              }
            });
            let tempPercentage: number = 0;
            tempPercentage = Number((100 - ((score / pulses.length) * 100)).toFixed(2));
            let displayPercentage = Number(((score / pulses.length) * 100).toFixed(0));
            this.tempStyle = {
              background: '-webkit-linear-gradient(top, #fff 0%, #fff ' + tempPercentage + '%, #db3f02 ' + tempPercentage + '%, #db3f02 100%)'
            };

            this.setState({
              status: 'showTemperature',
              items: [],
              showPulses: false,
              showLoading: false,
              showTemperature: true,
              temperature: displayPercentage,
              happyCount: happyScore,
              mehCount: mehScore,
              sadCount: sadScore,
              pulseText: pulseText
            });
            return null;
          });
        }
  }

  private createItem(feeling): void {
    this.setState({
      status: 'getPulse',
      items: [],
      showPulses: false,
      showLoading: true,
      showTemperature: false,
      temperature: 0,
        happyCount: 0,
        mehCount: 0,
        sadCount:0,
        pulseText: ''
    });

    this.getListItemEntityTypeName()
      .then((listItemEntityTypeName: string): void => {
        this.listItemEntityTypeName = listItemEntityTypeName;
        if (Environment.type === EnvironmentType.Local) {
          MockService.add(this.listItemEntityTypeName, feeling);
        }
        else if (Environment.type == EnvironmentType.SharePoint ||
          Environment.type == EnvironmentType.ClassicSharePoint) {
          SPService.add(this.listItemEntityTypeName, feeling, this.props.spHttpClient, this.props.siteUrl, this.props.listName);
        }
        
      });
      var dateToSet = new Date();
      localStorage.setItem(this.localStorageKeyLastDate, dateToSet.toString());
      this.showTemperature();
      return null;
  }

  private _getTodayPulses(): Promise<IPulseItem[]> {
    if (Environment.type === EnvironmentType.Local) {
      return MockService.get();
    }
    else if (Environment.type == EnvironmentType.SharePoint ||
      Environment.type == EnvironmentType.ClassicSharePoint) {
      return SPService.get(this.props.spHttpClient, this.props.siteUrl, this.props.listName);
    }
  }

  private getListItemEntityTypeName(): Promise<string> {

    if (Environment.type === EnvironmentType.Local) {
      return MockService.getEntityTypeName();
    }
    else if (Environment.type == EnvironmentType.SharePoint ||
      Environment.type == EnvironmentType.ClassicSharePoint) {
      return SPService.getEntityTypeName(this.listItemEntityTypeName, this.props.spHttpClient, this.props.siteUrl, this.props.listName);
    }
  }

}
