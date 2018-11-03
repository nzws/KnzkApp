function searchEmoji(query) {
  const els = document.getElementsByClassName('emoji_button')

  if (query) {
    $('.emoji_cate_box').addClass('ep_search_box')
    $('.emoji_button:not(.invisible)').addClass('invisible')
    $('.ep_cate_title').addClass('invisible')
    $('#ep_search_result_title').removeClass('invisible')
    emoji_search.filter((value, index, array) => {
      if (value.indexOf(query) !== -1) {
        els[index].className = 'emoji_button button button--quiet'
      }
    })
  } else {
    $('.emoji_cate_box').removeClass('ep_search_box')
    $('.emoji_button').removeClass('invisible')
    $('.ep_cate_title').removeClass('invisible')
    $('#ep_search_result_title').addClass('invisible')
  }
}

function renderEmoji(emojiobj) {
  let i = 0
  const reshtml = ''
  const list = {}
  let key
  let search = ''
  let s = 0
  if (emojiobj.dataset.isload === 'no') {
    emojiobj.dataset.isload = 'yes'
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        emoji_search = []
        const json = JSON.parse(this.responseText)
        while (json[i]) {
          if (!list[json[i]['category']]) list[json[i]['category']] = ''
          search = ''
          search += json[i]['description']
          if (json[i]['aliases'][0]) {
            while (json[i]['aliases'][s]) {
              search += '/' + json[i]['aliases'][s]
              s++
            }
          }
          if (json[i]['tags'][0]) {
            s = 0
            while (json[i]['tags'][s]) {
              search += '/' + json[i]['tags'][s]
              s++
            }
          }
          emoji_search.push(search)
          list[json[i]['category']] +=
            '<button onclick=\'add_emoji_simple("' +
            json[i]['emoji'] +
            "\")' class='ep_bt emoji_button button button--quiet' data-search='" +
            search +
            "'>" +
            twemoji.parse(json[i]['emoji']) +
            '</button>\n'
          i++
        }
        displayEmojiList(emojiobj, list, 0)
      }
    }
    xhr.open('GET', 'lib/emoji.json', false)
    xhr.send(null)
  }
}

function returnEmojiCategoryStr(id) {
  return i18next.t('emoji_category.' + id)
}

function displayEmojiList(emojiobj, list, dispnum) {
  const locale = {
    Custom: returnEmojiCategoryStr('Custom'),
    People: returnEmojiCategoryStr('People'),
    Nature: returnEmojiCategoryStr('Nature'),
    Foods: returnEmojiCategoryStr('Foods'),
    Activity: returnEmojiCategoryStr('Activity'),
    Places: returnEmojiCategoryStr('Places'),
    Objects: returnEmojiCategoryStr('Objects'),
    Symbols: returnEmojiCategoryStr('Symbols'),
    Flags: returnEmojiCategoryStr('Flags')
  }
  let key
  let i = 0
  let ok = false
  let pre = ''
  for (key in list) {
    if (dispnum === i) {
      if (dispnum !== 0) pre = emojiobj.innerHTML
      emojiobj.innerHTML =
        pre +
        "<div id='emojip_" +
        key +
        "' class='emoji_cate_box'><ons-list-title class='ep_cate_title'>" +
        locale[key] +
        '</ons-list-title>' +
        list[key] +
        '</div>'
      ok = true
      break
    } else {
      i++
      ok = false
    }
  }
  if (ok)
    setTimeout(() => {
      displayEmojiList(emojiobj, list, dispnum + 1)
    }, 1000)
  else renderCustomEmoji(emojiobj)
}

function renderCustomEmoji(emojiobj) {
  let i = 0
  let customreshtml = ''
  const search_a_custom = []
  const load = elemId('emoji_loading')
  if (!getConfig(1, 'no_custom_emoji')) {
    Fetch('https://' + inst + '/api/v1/custom_emojis', {
      headers: { 'content-type': 'application/json' },
      method: 'GET'
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          //カスタム絵文字非対応インスタンス
          $('#toot_emoji_bt').addClass('invisible')
        }
      })
      .then(json => {
        if (json) {
          const emoji_mode = getConfig(1, 'no_gif') ? 'static_url' : 'url'
          i = 0
          while (json[i]) {
            search_a_custom.push(json[i]['shortcode'])
            customreshtml +=
              '<button onclick=\'add_emoji_simple(" :' +
              json[i]['shortcode'] +
              ': ")\' class=\'emoji_button button button--quiet\'><img draggable="false" class="emojione" src="' +
              json[i][emoji_mode] +
              '"></button>\n'
            i++
          }
          emoji_search = search_a_custom.concat(emoji_search)
          customreshtml =
            "<div id='emojip_custom' class='emoji_cate_box'><ons-list-title class='ep_cate_title'>" +
            returnEmojiCategoryStr('Custom') +
            '</ons-list-title>' +
            customreshtml +
            '</div>'
          emojiobj.innerHTML =
            "<ons-list-title class='invisible' id='ep_search_result_title'>" +
            i18next.t('emoji_category.Search') +
            '</ons-list-title>' +
            customreshtml +
            emojiobj.innerHTML
        }
        load.className = 'invisible'
        load.innerHTML = ''
      })
  } else {
    load.className = 'invisible'
    load.innerHTML = ''
  }
}

function jumpEmoji(category) {
  $('[id^=emojip_]').addClass('invisible')
  $('#emojip_' + category).removeClass('invisible')
  $('.ep_category').addClass('ep_category_r')
  $('#emoji_reset').removeClass('invisible')
  $('#emoji_list_popover').scrollTop(0)
}

function resetEmoji() {
  $('[id^=emojip_]').removeClass('invisible')
  $('.ep_category').removeClass('ep_category_r')
  $('#emoji_reset').addClass('invisible')
  $('#emoji_list_popover').scrollTop(0)
}
