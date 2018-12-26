import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from '@angular/fire/firestore';
import { SleepData } from '../data/sleep-data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
	collection:AngularFirestoreCollection;

  constructor(db:AngularFirestore) {
  	this.collection = db.collection('a5-sleeptracker');
  }

  addSleepLog(sleepLog:SleepData) {
  	//TODO: implement this function to add sleep logs
  }

  getSleepLogs():Observable<DocumentData[]> {
  	//TODO: implement this function to retrieve sleep logs
    return undefined;
  }
}
