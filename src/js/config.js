function getConfig(type, name) {
  if (!config_tmp[type]) {
    if (type === 1) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon')
    else if (type === 2) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodoncol')
    else if (type === 3) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_timeline')
    else if (type === 4) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_push')
    else if (type === 5) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_filter')
  }

  let data = config_tmp[type]
  data = JSON.parse(data)
  if (type === 3) {
    const acct = now_userconf['username'] + '@' + inst
    data[name] = data[acct] ? data[acct][name] : data['origin'][name]
  }
  return data[name] ? data[name] : ''
}

function getConfig_original(type) {
  if (!config_tmp[type]) {
    if (type === 1) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon')
    else if (type === 2) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodoncol')
    else if (type === 3) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_timeline')
    else if (type === 4) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_push')
    else if (type === 5) config_tmp[type] = localStorage.getItem('knzkapp_conf_mastodon_filter')
  }
  return JSON.parse(config_tmp[type])
}

function change_conf(name, id, sel, istext) {
  const md = name === 1 ? 'knzkapp_conf_mastodon' : 'knzkapp_conf_mastodoncol'
  const data = JSON.parse(localStorage.getItem(md))
  if (sel) {
    data[id] = elemId('conf-' + id).value
  } else {
    let colmd = ''
    if (md === 'knzkapp_conf_mastodoncol') colmd = 'col-'
    const mode = elemId('conf-' + colmd + id).checked
    if (istext) data[id] = platform === 'ios' ? (mode == true ? '0' : '1') : mode == true ? '1' : '0'
    else data[id] = platform === 'ios' ? (mode == true ? 0 : 1) : mode == true ? 1 : 0
  }
  localStorage.setItem(md, JSON.stringify(data))
  config_tmp[name] = null
}

function setConfig(name, id, value) {
  //data->1: 基本設定, data->2: col
  let md = ''
  if (name === 1) md = 'knzkapp_conf_mastodon'
  else if (name === 2) md = 'knzkapp_conf_mastodoncol'
  else if (name === 3) md = 'knzkapp_conf_mastodon_timeline'
  else if (name === 4) md = 'knzkapp_conf_mastodon_push'
  else if (name === 5) md = 'knzkapp_conf_mastodon_filter'

  const data = JSON.parse(localStorage.getItem(md))
  data[id] = value
  localStorage.setItem(md, JSON.stringify(data))
  config_tmp[name] = null
}

const ConfigSetup = () =>
  new Promise((resolve, reject) => {
    const last_version = 6

    if (!localStorage.getItem('knzkapp_conf_mastodon')) {
      if (localStorage.getItem('knzk_realtime') == undefined) localStorage.setItem('knzk_realtime', 1)
      if (localStorage.getItem('knzk_dial') == undefined) localStorage.setItem('knzk_dial', 'change')
    }

    if (localStorage.getItem('knzkapp_conf_version') == undefined) localStorage.setItem('knzkapp_conf_version', 1)

    const now_version = parseInt(localStorage.getItem('knzkapp_conf_version'))
    if (now_version !== last_version) {
      show('DB_migration')
      let mig_i = 0
      if (now_version < 2) {
        //config migration v1 -> v2
        /**
         * v2
         * 散らばっていたconfigをまとめました。
         */
        const accountdata = {
          list: localStorage.getItem('knzk_account_list'),
          token: localStorage.getItem('knzk_account_token'),
          userid: localStorage.getItem('knzk_userid'),
          username: localStorage.getItem('knzk_username'),
          domain: localStorage.getItem('knzk_login_domain')
        }
        const list_d = [
          'bigfav',
          'nsfw',
          'cw',
          'realtime',
          'spin',
          'swipe',
          'joke',
          'menu-fav',
          'image_full',
          'swipe_menu',
          'head_reset',
          'dial',
          'theme',
          'url_open'
        ]
        const list_col = ['alert', 'all', 'bg', 'bs', 'collapse', 'leng', 'media', 'preview']
        const new_conf = {}
        const new_conf_col = {}
        mig_i = 0
        while (list_d[mig_i]) {
          new_conf[list_d[mig_i]] =
            localStorage.getItem('knzk_' + list_d[mig_i]) == undefined
              ? ''
              : localStorage.getItem('knzk_' + list_d[mig_i])
          mig_i++
        }
        mig_i = 0
        while (list_col[mig_i]) {
          new_conf_col[list_col[mig_i]] =
            localStorage.getItem('conf-col-' + list_col[mig_i]) == undefined
              ? ''
              : localStorage.getItem('conf-col-' + list_col[mig_i])
          mig_i++
        }
        localStorage.clear()

        localStorage.setItem('knzkapp_conf_mastodon', JSON.stringify(new_conf))
        localStorage.setItem('knzkapp_conf_mastodoncol', JSON.stringify(new_conf_col))

        if (accountdata['list']) localStorage.setItem('knzkapp_account_list', accountdata['list'])
        if (accountdata['token']) localStorage.setItem('knzkapp_now_mastodon_token', accountdata['token'])
        if (accountdata['userid']) localStorage.setItem('knzkapp_now_mastodon_id', accountdata['userid'])
        if (accountdata['username']) localStorage.setItem('knzkapp_now_mastodon_username', accountdata['username'])
        if (accountdata['domain']) localStorage.setItem('knzkapp_now_mastodon_domain', accountdata['domain'])
      }
      if (now_version < 3) {
        localStorage.setItem(
          'knzkapp_conf_mastodon_timeline',
          JSON.stringify({
            config: ['home', 'local', 'public', 'local_media', 'public_media'],
            default: 0,
            list_names: {}
          })
        )
      }
      if (now_version < 4) {
        localStorage.setItem('knzkapp_conf_mastodon_push', JSON.stringify({}))
        localStorage.setItem('knzkapp_conf_mastodon_filter', JSON.stringify({ notification: {} }))
      }
      if (now_version < 5) {
        if (localStorage.getItem('knzkapp_now_mastodon_id')) {
          localStorage.setItem('knzkapp_now_token', localStorage.getItem('knzkapp_now_mastodon_token'))
          localStorage.setItem('knzkapp_now_id', localStorage.getItem('knzkapp_now_mastodon_id'))
          localStorage.setItem('knzkapp_now_username', localStorage.getItem('knzkapp_now_mastodon_username'))
          localStorage.setItem('knzkapp_now_domain', localStorage.getItem('knzkapp_now_mastodon_domain'))
          localStorage.removeItem('knzkapp_now_mastodon_token')
          localStorage.removeItem('knzkapp_now_mastodon_id')
          localStorage.removeItem('knzkapp_now_mastodon_username')
          localStorage.removeItem('knzkapp_now_mastodon_domain')

          const acctlist = JSON.parse(localStorage.getItem('knzkapp_account_list'))
          mig_i = 0
          if (acctlist) {
            while (acctlist[mig_i]) {
              acctlist[mig_i]['service'] = 'mastodon'
              mig_i++
            }
          }
          localStorage.setItem('knzkapp_account_list', JSON.stringify(acctlist))
        }
      }
      if (now_version < 6) {
        const v6d = JSON.parse(localStorage.getItem('knzkapp_conf_mastodon_timeline'))

        localStorage.setItem(
          'knzkapp_conf_mastodon_timeline',
          JSON.stringify({
            origin: {
              config: v6d['config'],
              default: v6d['default'],
              list_names: v6d['list_names'] ? v6d['list_names'] : {}
            }
          })
        )
      }

      localStorage.setItem('knzkapp_conf_version', last_version)
      hide('DB_migration')
      resolve()
    }
  })

function clearAllConfig() {
  ons.notification
    .confirm(dialog_i18n('clear_config', 1), {
      title: dialog_i18n('clear_config'),
      modifier: 'material',
      cancelable: true
    })
    .then(e => {
      if (e === 1) {
        localStorage.setItem(
          'knzkapp_conf_mastodon',
          JSON.stringify({
            realtime: 1,
            dial: 'change'
          })
        )
        localStorage.setItem('knzkapp_conf_mastodoncol', JSON.stringify({}))
        localStorage.setItem(
          'knzkapp_conf_mastodon_timeline',
          JSON.stringify({
            origin: {
              config: ['home', 'local', 'public', 'local_media', 'public_media'],
              default: 0,
              list_names: {}
            }
          })
        )
        localStorage.setItem('knzkapp_conf_mastodon_push', JSON.stringify({}))
        localStorage.setItem('knzkapp_conf_mastodon_filter', JSON.stringify({ notification: {} }))
        ons.notification.toast(i18next.t('dialogs_js.clear_done'))
      }
    })
}

function renderPreview() {
  const data = {
    id: 'example1',
    created_at: '2018-08-29T01:03:49.740Z',
    spoiler_text: '',
    visibility: 'public',
    content: '<p>月が綺麗ですね。</p>',
    favourited: false,
    reblogged: false,
    muted: false,
    application: {},
    account: {
      id: 'exmaple1',
      username: 'KnzkApp',
      acct: 'KnzkApp',
      display_name: 'KnzkApp',
      avatar: 'img/missing.png',
      avatar_static: 'img/missing.png'
    },
    media_attachments: [],
    mentions: [],
    tags: [],
    emojis: []
  }
  elemId('font-preview').innerHTML = toot_card(data, 'full')
}

function renderFontConfig() {
  let css = ''
  if (getConfig(1, 'spin') == 1 || getConfig(1, 'gpu') != 1) {
    if (getConfig(1, 'spin') == 1) css += '.fa-spin {-webkit-animation: none;  animation: none;}'
    if (getConfig(1, 'gpu') != 1) css += '.toot, .timeline {transform: translate3d(0, 0, 0);}'
    if (getConfig(1, 'font_button')) {
      /*
      if (getConfig(1, 'toot_button') === 'large') {
        css += '.toot-button { margin-right: 0.5em; font-size: xx-large; }';
      } else if (getConfig(1, 'toot_button') === 'small') {
        css +=
          '.toot-button { margin-right: 1.5em; font-size: large; } .date-disp { margin-top: 0 }';
      }
      */
      const f_b = 48 * (parseInt(getConfig(1, 'font_button')) * 0.01)
      css += '.toot-button { font-size: ' + f_b + 'px; }'
    }
    if (getConfig(1, 'font_body')) {
      const f = 28 * (parseInt(getConfig(1, 'font_body')) * 0.01)
      css +=
        '.toot_content > p { font-size: ' +
        f +
        'px; } .toot_content .emoji, .toot_content .emojione { height: ' +
        (f + 6) +
        'px !important; width: ' +
        (f + 6) +
        'px !important; }'
    }
  }
  elemId('font-config').innerHTML = css
}
