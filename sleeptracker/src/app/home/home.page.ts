import { Component } from '@angular/core';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { AlertController } from '@ionic/angular';
import '../../assets/circle_selector';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
    btn2_txt: string = 'Log it';
    btn3_txt: string = 'View Sleepiness Level';
    app_logo: string = '../../assets/icon/sleep_tracker_white.png';
    slideOpts = {effect: 'flip'};
    today: number = Date.now();
    clock: any = setInterval(() => { this.clock = Date.now(); }, 1000); // refreshes every second to produce a running clock

    // variables to record time for log data
    startTime: number;
    endTime: number;
    btn1_txt: string;
    logged_time = Date.now();
    st_time1: any;
    end_time1: any;
    st_time: any;
    end_time: any;
    sleepiness_level: number;
    val: number;

    // gather information from various classes for data display
    sleep_logs = [];
    sleepiness_logs = [];
    sleepiness_summary = [];
    sleepness: string = '';
    sleepiness_text: string = '';
    num_sleep_logs: number;
    avg_bedtime: string;
    longest_bedtime: string = '';
    longest_bedtime_date: string = '';
    shortest_bedtime: string = '';
    shortest_bedtime_date: string = '';
    has_data: boolean; //set card for "Data" tab
    num_sleepiness_logs: number;
    num_level1_logs: number;
    num_level2_logs: number;
    num_level3_logs: number;
    num_level4_logs: number;
    num_level5_logs: number;
    num_level6_logs: number;
    num_level7_logs: number;

	constructor(public sleepService:SleepService, public alertController: AlertController) {
        // following adds default data to firebase database (to make sure that the "Data" tab works from the beginning)
        // this.sleepService.logOvernightData(new OvernightSleepData(new Date('November 12, 2018 01:03:00'), new Date('November 12, 2018 09:25:00')));
        // this.sleepService.logOvernightData(new OvernightSleepData(new Date('November 12, 2018 23:11:00'), new Date('November 13, 2018 08:03:00')));
        // this.sleepService.logSleepinessData(new StanfordSleepinessData(4, new Date('November 12, 2018 14:38:00')));
	}

	ngOnInit() {
        // initializes the button's text (which will change after user clicks)
        this.btn1_txt = 'Going to Bed';
        this.sleepness = 'sleep_seg';
        this.sleep_logs = this.allOvernightData;
        this.sleepiness_logs = this.allSleepinessData;
	}

	/* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
	get allSleepData() {
		return SleepService.AllSleepData;
	}
    get allOvernightData() {
        return SleepService.AllOvernightData;
    }
    get allSleepinessData(){
        return SleepService.AllSleepinessData;
    }
    get allScaleValue(){
        return StanfordSleepinessData.ScaleValues;
    }

    // show message corresponding to button press and save bedtime logs at the end
    async timerMessage() {
        if(this.btn1_txt === 'Going to Bed'){
            const startTimer = await this.alertController.create({
              header: 'Good Night!',
              buttons: ['OK']
            });

            this.btn1_txt = 'Start my Day';
            this.startTime = Date.now();
            var t = new Date();
            this.st_time1 = t.getHours() + ':' + t.getMinutes();
            await startTimer.present();
        }
        else {
            this.btn1_txt = 'Going to Bed';
            this.endTime = Date.now();
            var t = new Date();
            this.end_time1 = t.getHours() + ':' + t.getMinutes();
            this.sleepService.logOvernightData(new OvernightSleepData(new Date(this.startTime), new Date(this.endTime)));

            const endTimer = await this.alertController.create({
              header: 'Good Morning!',
              message: 'Start time: ' + this.st_time1 + '<br/>End time: ' + this.end_time1 + '<br/>You Slept: ' + this.sleepService.getLastHour(),
              buttons: ['OK']
            });
            await endTimer.present();
        }
        this.sleep_hours_data();
    }

    // show message corresponding to button press for bedtime logs and add them to logs
    async selfLog() {
        if(this.st_time == undefined && this.end_time == undefined){
            const needBothFields = await this.alertController.create({
              header: 'Please specify start & end time!',
              buttons: ['OK']
            });

            await needBothFields.present();
        }
        else if(this.st_time == undefined){
            const needStartTime = await this.alertController.create({
              header: 'Please specify start time!',
              buttons: ['OK']
            });

            await needStartTime.present();
        }
        else if(this.end_time == undefined){
            const needEndTime = await this.alertController.create({
              header: 'Please specify end time!',
              buttons: ['OK']
            });

            await needEndTime.present();
        }
        else{
            var timer1 = this.st_time.split(':');
            var hour1 = timer1[0];
            var minute1 = timer1[1];
            var timer2 = this.end_time.split(':');
            var hour2 = timer2[0];
            var minute2 = timer2[1];
            var started = new Date();
            var ended = new Date();
            if(this.st_time < this.end_time){
                started.setHours(hour1);
                started.setMinutes(minute1);
                ended.setHours(hour2);
                ended.setMinutes(minute2);
            }
            else{
                started.setDate(started.getDate() - 1);
                started.setHours(hour1);
                started.setMinutes(minute1);
                ended.setHours(hour2);
                ended.setMinutes(minute2);
            }
            this.sleepService.logOvernightData(new OvernightSleepData(started, ended));
            // console.log(this.allOvernightData);

            const showLogTime = await this.alertController.create({
              header: 'Time Logged',
              message: 'Start time: ' + this.st_time + '<br/>End time: ' + this.end_time + '<br/>You Slept: ' + this.sleepService.getLastHour(),
              buttons: ['OK']
            });

            await showLogTime.present();
        }
        this.reload_sleep();
        this.sleep_hours_data();
    }

    async display_level(){
        const sleepinessLevel = await this.alertController.create({
          header: 'Sleepiness Levels',
          message: '<p class="sleepiness_cap"><strong>Level 1</strong><br>'+this.allScaleValue[1]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 2</strong><br>'+this.allScaleValue[2]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 3</strong><br>'+this.allScaleValue[3]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 4</strong><br>'+this.allScaleValue[4]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 5</strong><br>'+this.allScaleValue[5]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 6</strong><br>'+this.allScaleValue[6]+'</p>'+
          '<p class="sleepiness_cap"><strong>Level 7</strong><br>'+this.allScaleValue[7]+'</p>',
          buttons: ['Dismiss']
        });

        await sleepinessLevel.present();
    }

    // show message corresponding to button press for sleepiness logs and add them to logs
    async sleepiness_log(){
      var current_time = Date.now();
      this.sleepService.logSleepinessData(new StanfordSleepinessData(this.sleepiness_level, new Date(current_time)));

      const confirmSleepinessLog = await this.alertController.create({
        header: 'Sleepiness Logged',
        buttons: ['OK']
      });

      await confirmSleepinessLog.present();

      this.reload_sleepiness();
      this.sleepiness_data();
    }

    // updates declared value for sleepiness and calls 'sleepiness_log' function to log the data if user clicks "Log It"
    async update_sleepiness(val: number){
        console.log('sleepiness level detected: ' + val);
        this.sleepiness_level = val;
        console.log(this.sleepiness_level);
        if(this.sleepiness_level === null || this.sleepiness_level === 0){
            let showChosenValue = await this.alertController.create({
              header: 'Choose one of the levels',
              buttons: ['OK']
            });

            await showChosenValue.present();
        }
        else{
            let showChosenValue = await this.alertController.create({
              header: 'You Chose Level ' + this.sleepiness_level,
              message: this.allScaleValue[this.sleepiness_level],
              buttons: ['Cancel',
                  {
                      text: 'Log It',
                      handler: () => {
                          this.sleepiness_log();
                      }
                  }]
            });

            await showChosenValue.present();
        }
    }

    // loads bedtime data when "Sleep Hour" segment button is clicked (it is selected by default)
    sleep_hours_data() {
        this.sleepService.reloadSleep();
    }

    // load sleepiness data when "Sleepiness" segment button is clicked
    sleepiness_data() {
        this.sleepness = 'sleepiness_seg';
        this.sleepService.reloadSleepiness();
    }

    /* follwoing function refreshes the date-time spinner when user tap on "Bedtime" tab
    the timer does not refresh because it might be running */
    reload_sleep(){
        this.st_time = null;
        this.end_time = null;
        this.sleepness = 'sleep_seg';
    }

    // following function gathers logged bedtime information, perform calculations and generate data for display in Data tab
    load_sleep_analysis(){
        this.longest_bedtime = '';
        this.shortest_bedtime = '';

        // sorts the logs by sleepStart so that it will be displayed in order
        this.sleep_logs.sort(function(a:any,b:any){
          return a.sleepStart - b.sleepStart;
        });

        this.num_sleep_logs = this.sleep_logs.length;
        //calculate average bedtime
        var totalMin = 0;
        for(var i = 0; i < this.sleep_logs.length; i++){
            var hour = parseInt(this.sleep_logs[i].summaryString().split(' hours')[0]);
            var min = this.sleep_logs[i].summaryString().split(', ')[1];
            var minute = parseInt(min.split(' minutes')[0]);
            totalMin += hour*60 + minute;

            // find longest bedtime date and hours
            if(this.longest_bedtime === ''){
                this.longest_bedtime = this.sleep_logs[i].summaryString();
                this.longest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
            }
            else{
                var long_hour = parseInt(this.longest_bedtime.split(' hours')[0]);
                var long_min = this.longest_bedtime.split(', ')[1];
                var long_minute = parseInt(long_min.split(' minutes')[0]);
                if(hour > long_hour){
                    this.longest_bedtime = this.sleep_logs[i].summaryString();
                    this.longest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
                }
                else if(hour === long_hour){
                    if(minute > long_minute){
                        this.longest_bedtime = this.sleep_logs[i].summaryString();
                        this.longest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
                    }
                }
            }

            // find shortest bedtime date and Hours
            if(this.shortest_bedtime === ''){
                this.shortest_bedtime = this.sleep_logs[i].summaryString();
                this.shortest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
            }
            else{
                var short_hour = parseInt(this.shortest_bedtime.split(' hours')[0]);
                var short_min = this.shortest_bedtime.split(', ')[1];
                var short_minute = parseInt(short_min.split(' minutes')[0]);
                if(hour < short_hour){
                    this.shortest_bedtime = this.sleep_logs[i].summaryString();
                    this.shortest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
                }
                else if(hour === short_hour){
                    if(minute < short_minute){
                        this.shortest_bedtime = this.sleep_logs[i].summaryString();
                        this.shortest_bedtime_date = this.sleep_logs[i].dateString().split('Night of ')[1];
                    }
                }
            }
        }
        //update declared variables for data displaying
        var totalAvg = totalMin / this.sleep_logs.length;
        var avgHr = (totalAvg / 60) | 0;
        var avgMin = (totalAvg % 60) | 0;
        this.avg_bedtime = avgHr + ' hr ' + avgMin + ' min';
        this.longest_bedtime = this.longest_bedtime.replace('hours', 'hr');
        this.longest_bedtime = this.longest_bedtime.replace('minutes', 'min');
        this.shortest_bedtime = this.shortest_bedtime.replace('hours', 'hr');
        this.shortest_bedtime = this.shortest_bedtime.replace('minutes', 'min');
    }

    load_sleepiness_analysis() {
        // sorts the logs by loggedAt so that it will be displayed in order
        this.sleepiness_logs.sort(function(a:any,b:any){
          return a.loggedAt - b.loggedAt;
        });
        // put sorted information into array for display
        this.sleepiness_summary = [];
        for(var i = 0; i < this.sleepiness_logs.length; i++) {
            this.sleepiness_summary.push({
                    'sleepiness_time' : this.sleepiness_logs[i].loggedAt,
                    'sleepiness_state' : this.sleepiness_logs[i].summaryString().split(': ')[1]
            })
        }

        this.num_sleepiness_logs = this.sleepiness_summary.length;
        this.num_level1_logs = 0;
        this.num_level2_logs = 0;
        this.num_level3_logs = 0;
        this.num_level4_logs = 0;
        this.num_level5_logs = 0;
        this.num_level6_logs = 0;
        this.num_level7_logs = 0;

        for (var i = 0; i < this.sleepiness_logs.length; i++){
          if (this.sleepiness_logs[i].loggedValue === 1){
            this.num_level1_logs+= 1;
          }
          else if (this.sleepiness_logs[i].loggedValue === 2){
            this.num_level2_logs+= 1;
          }
          else if (this.sleepiness_logs[i].loggedValue === 3){
            this.num_level3_logs+= 1;
          }
          else if (this.sleepiness_logs[i].loggedValue === 4){
            this.num_level4_logs+= 1;
          }
          else if (this.sleepiness_logs[i].loggedValue === 5){
            this.num_level5_logs+= 1;
          }
          else if (this.sleepiness_logs[i].loggedValue === 6){
            this.num_level6_logs+= 1;
          }
          else{
            this.num_level7_logs+= 1;
          }
        }
    }

    // following function refreshes the "Sleepiness" tab so that users do not see previously selected values
    reload_sleepiness(){
        this.sleepiness_level = null;
    }

    // following function refreshes the "Data" tab so that users will be able to tab on the segment button to view data that are up-to-date
    reload_cards(){
        this.sleepness = 'sleep_seg';
        this.sleep_logs = this.allOvernightData;
        this.sleepiness_logs = this.allSleepinessData;
        this.load_sleep_analysis();
        this.load_sleepiness_analysis();
    }
}
