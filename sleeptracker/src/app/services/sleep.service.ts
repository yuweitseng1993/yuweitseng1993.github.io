import { Injectable } from '@angular/core';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	private static LoadDefaultData:boolean = true;
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];

    public static ThisOvernightData:OvernightSleepData[] = [];
    sleepCollection:AngularFirestoreCollection;
    sleepinessCollection:AngularFirestoreCollection;

  constructor(public db:AngularFirestore) {
  	// if(SleepService.LoadDefaultData) {
    //   this.addDefaultData();
  	// 	SleepService.LoadDefaultData = false;
  	// }
    this.sleepCollection = db.collection('sleep-collection');
    this.sleepinessCollection = db.collection('sleepiness-collection');

    this.db.collection('sleepiness-collection').valueChanges().subscribe((DocumentData) => {
        // console.log(DocumentData);
        DocumentData.forEach(function(element) {
            SleepService.AllSleepinessData.push(new StanfordSleepinessData(element['loggedValue'], new Date(element['loggedAt'])));
        })
    });
  }

  // private addDefaultData() {
  //   this.logOvernightData(new OvernightSleepData(new Date('November 12, 2018 01:03:00'), new Date('November 12, 2018 09:25:00')));
  //   this.logSleepinessData(new StanfordSleepinessData(4, new Date('November 12, 2018 14:38:00')));
  //   this.logOvernightData(new OvernightSleepData(new Date('November 12, 2018 23:11:00'), new Date('November 13, 2018 08:03:00')));
  //   //added more default data for testing "data" tab
  //   this.logOvernightData(new OvernightSleepData(new Date('November 13, 2018 22:45:00'), new Date('November 14, 2018 07:25:00')));
  //   this.logOvernightData(new OvernightSleepData(new Date('November 15, 2018 00:32:00'), new Date('November 15, 2018 11:19:00')));
  //   this.logOvernightData(new OvernightSleepData(new Date('November 15, 2018 23:46:00'), new Date('November 16, 2018 06:37:00')));
  //   this.logOvernightData(new OvernightSleepData(new Date('November 16, 2018 22:15:00'), new Date('November 17, 2018 10:25:00')));
  //   this.logSleepinessData(new StanfordSleepinessData(2, new Date('November 13, 2018 00:24:00')));
  //   this.logSleepinessData(new StanfordSleepinessData(7, new Date('November 14, 2018 16:04:00')));
  //   this.logSleepinessData(new StanfordSleepinessData(1, new Date('November 15, 2018 21:28:00')));
  // }

  public logOvernightData(sleepData:OvernightSleepData) {
  	// SleepService.AllOvernightData.push(sleepData);
  	SleepService.ThisOvernightData.push(sleepData);
    this.addSleepLog(sleepData);
  }

  public addSleepLog(sleepLog:SleepData) {
  	//TODO: implement this function to add sleep logs
    var data = {
        'id':sleepLog.id,
        'loggedAt':sleepLog.loggedAt.getTime(),
        'sleepStart':sleepLog['sleepStart'].getTime(),
        'sleepEnd':sleepLog['sleepEnd'].getTime()
    }
    this.db.collection('sleep-collection').add(data)
    .then(function(docRef) {
        console.log("Sleep data written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding sleep data: ", error);
    })
  }

  public reloadSleep() {
      SleepService.AllOvernightData = [];
      this.db.collection('sleep-collection').valueChanges().subscribe((DocumentData) => {
          // console.log(DocumentData);
          DocumentData.forEach(function(element) {
              SleepService.AllOvernightData.push(new OvernightSleepData(new Date(element['sleepStart']), new Date(element['sleepEnd'])))
          })
      });
  }
  // used to showing part of logged sleep to user after data being saved
  public getLastHour() {
      return SleepService.ThisOvernightData[SleepService.ThisOvernightData.length - 1].summaryString();
  }

  public logSleepinessData(sleepData:StanfordSleepinessData) {
    this.addSleepinessLog(sleepData);
  }

  public addSleepinessLog(sleepinessLog:SleepData) {
      var data = {
          'id':sleepinessLog.id,
          'loggedAt':sleepinessLog.loggedAt.getTime(),
          'loggedValue':sleepinessLog['loggedValue']
      }
      this.db.collection('sleepiness-collection').add(data)
      .then(function(docRef) {
          console.log("Sleepiness data written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding sleepiness data: ", error);
      })
  }

  public reloadSleepiness() {
      SleepService.AllSleepinessData = [];
      this.db.collection('sleepiness-collection').valueChanges().subscribe((DocumentData) => {
          // console.log(DocumentData);
          DocumentData.forEach(function(element) {
              SleepService.AllSleepinessData.push(new StanfordSleepinessData(element['loggedValue'], new Date(element['loggedAt'])));
          })
      });
  }
}
