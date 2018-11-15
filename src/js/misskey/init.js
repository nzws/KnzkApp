const mk_init = {}

mk_init.init = function() {
  if (!localStorage || !Fetch) {
    show('cannot-use-ls')
    return
  }

  if (!localStorage.getItem('knzkapp_now_token')) {
    location.href = 'index.html'
    return
  }

  show('starting_screen')

  try {
    knzkMk.me = {
      token: localStorage.getItem('knzkapp_now_token'),
      id: localStorage.getItem('knzkapp_now_id'),
      username: localStorage.getItem('knzkapp_now_username')
    }
    inst = localStorage.getItem('knzkapp_now_domain').toLowerCase()
  } catch (e) {
    starting_alert('err')
    getError('Error/init_login', e)
    return false
  }
}
