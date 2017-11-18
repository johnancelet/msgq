import template from './new-upstream.pug';

class NewUpstreamcontroller {
  /* @ngInject */
  constructor($http, $stateParams, $state, Session, Enum, toast) {
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.Session = Session;
    this.Enum = Enum;
    this.routes = this.Enum.routes;
    this.toast = toast;
  }

  $onInit() {
    this.user = this.Session.read('userinfo');
    this.data = {
      active: 1,
      routeId: 1,
    };
    this.get();
  }

  get() {
    const { id } = this.$stateParams;
    if (!id) return;
    this
      .$http
      .get(`/upstreams/${id}`)
      .then(({ data }) => this.data = data)
      .catch(this.toast.next);
  }

  submit() {
    const { id } = this.$stateParams;
    this.$http.post(`/upstreams/${id || ''}`, this.data)
      .then((x) => {
        const { data = { id } } =x;
        console.log(data, x);
        this.toast.show('success');
        this.$state.go('upstream.view', data);
      })
      .catch(this.toast.next);
  }
}

const NewUpstreamComponent = {
  template,
  controller: NewUpstreamcontroller,
};

export default NewUpstreamComponent;

