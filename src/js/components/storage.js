export default {
  save() {
    return (localStorage.knzkapp_v2_config = JSON.stringify(knzk.conf));
  }
};
