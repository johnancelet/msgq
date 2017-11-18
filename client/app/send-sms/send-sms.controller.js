class SendSmsController {
  /* @ngInject */
  constructor($http, $state, $stateParams,Session, $scope, $timeout, TransliterationControl, ScheduleSms) {
    this.$http = $http;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.Session = Session;
    this.Math = Math;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.TransliterationControl = TransliterationControl;
    this.ScheduleSms = ScheduleSms;
  }

  $onInit() {
    this.langs = [{ name: 'English', val: 0 }, { name: 'Unicode', val: 1 }];
    this.numbers = this.$stateParams.contacts || '';
    this.selectedGroups = '';
    this.contactCounts = 0;
    this.user = this.Session.read('userinfo');
    this.data = {
      numbersList: [],
      senderId: '',
      message: '',
      unicode: 1,
    }; //body of Api

    this.senderIdLength = 0;
    this.change = () => {
      this.senderIdLength = document.querySelector('#senderId').value.length;
    };

    this.error = {};
    this.routeIndex = 1;
    this.numberPattern = /[987]{1}\d{9}/;
    this.routes = [];

    // load initial routes on top
    this
      .$http
      .get('/routes')
      .then(({ data: routes }) => {
        this.routes = routes.length ? routes : [{ id: 1, name: 'Promotional', balance: 50 }];
        this.data.routeId = this.routes[0].id;
      });
    this.translation('true');
  }

  setRoute(routeId) {
    this.data.routeId = routeId;
    if (routeId === 1) return this.loadSenderIds();
    return (this.senderId = '');
  }

  translation(unicode) {
    console.log('unicode', unicode)
    if (unicode === 'true') {
      console.log('unicode')
      // Load the Google Transliterate API
      this.$timeout(() => {
        // Enable transliteration in the textbox with id
        // 'transliterateTextarea'.
        this.TransliterationControl.makeTransliteratable(['transliterateTextarea']);
        this.TransliterationControl.showControl('translControl');
      }, 0);

    } else {
      console.log('engilsh ')

    }
  }

  validateNumbers() {
    if (!this.numbers) return;
    const numbers = this.numbers.replace(/\n/g, ',').split(',');

    const numbersList = [];
    numbers.forEach(n => {
      const reg = n.match(this.numberPattern);
      if (numbersList.includes(n) || !reg) {
        this.foundInvalidNumber = true;
        return;
      }
      numbersList.push(n);
    });
    this.numbers = numbers.join(',');
    if (this.foundInvalidNumber) {
      this.error.numberError = 'Some numbers were invalid/duplicate and were removed.';
    } else this.data.numbers = numbersList.join(',');
  }

  loadSenderIds() {
    //load SenderIds on focus of message field
    this.field = 'senderId';
    this
      .$http
      .get('/senderId', { params: { fl: 'id,name,senderIdStatusId', status: '1,2' } })
      .then(({ data: senderIds }) => {
        this.list = this.senderIds = senderIds;
        if (!this.data.senderId && this.senderIds.length) {
          this.data.senderId = this.senderIds[0].name;
        }
      });
  }

  loadTemplates() {
    //load templates on focus of message field
    this.field = 'text';
    this
      .$http
      .get('/templates')
      .then(({ data: templates }) => (this.list = templates.items || templates));
  }

  loadCampaigns() {
    //load Campaigns on focus of message field
    this.field = 'campaign';
    this
      .$http
      .get('/campaigns')
      .then(({ data: campaigns }) => (this.list = campaigns.items || campaigns));
  }

  loadGroups() {
    //load initial Groups
    this.field = 'groupId';
    this
      .$http
      .get('/groups')
      .then(({ data: groups }) => (this.list = groups.items || groups));
  }

  sendSms() {
    this
      .$http
      .post('/sms', this.data)
      .then(({ data: message }) => this.message = message);
  }

  saveAsDraft() {
    this
      .$http
      .post('/drafts')
      .then(({ data: message }) => (this.message = message));
  }

  bindData(item, field) {
    this.contactCounts = 0;
    switch (field) {
      case 'groupId': {
        const selectedGrps = this.list.filter(x => x.isChecked);
        this.data.groupId = selectedGrps.map(x => x.id).join(',');
        this.selectedGroups = selectedGrps.map((x) => {
          this.contactCounts+= x.count;
          return x.name;
        });
        break;
      }
      default:
        this.data[field] = item.name;
    }
  }

}

export default SendSmsController;
