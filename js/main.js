// Turns all the sorts in #sorts into options
let sorts = $("#sorts").children().hide()
$("#sort_choice")
  .append(sorts.toArray().map(v => `<option value="${v.id}">${v.id}</option>`))
  .change(e => sorts.hide().filter((i, v) => v.id == e.target.value).show())

// Number sort
$("#in_numbers").keyup(e => {
  nums = e.target.value.match(/-?(\d+(\.\d+)?|\.\d+)/g)
  $("#out_numbers").text(nums ?
    nums.sort((a, b) => a - b).reduce((a, v) => a + ", " + v) :
    "The numbers will show up sorted here"
  )
})

// Uses Binary search to insert. For the fg_sort
async function bin_insert(a, e, cmp, i = 0, j = a.length - 1) {
  if (i > j) { a.splice(i, 0, e); return a }
  let mid = Math.floor((i + j) / 2)
  return await cmp(e, a[mid]) ? bin_insert(a, e, cmp, i, mid - 1) : bin_insert(a, e, cmp, mid + 1, j)
}

// Ford-Johnson algorithm based off the wikipedia article
// I couldn't quite figure out the ordering part so thats excluded
async function fj_sort(a, cmp) {
  if (a.length < 2) return a
  let pairs = []
  let leftover = a.length % 2 ? a.pop() : undefined
  for (let i = 0; i < a.length; i += 2)
    pairs.push(await cmp(a[i], a[i + 1]) ? [a[i], a[i + 1]] : [a[i + 1], a[i]])
  pairs = await fj_sort(pairs, (a, b) => cmp(a[0], b[0]))
  let sorted = pairs.pop(); next = []
  while (v = pairs.pop()) {
    sorted.unshift(v[0])
    sorted = await bin_insert(sorted, v[1], cmp)
  }
  if (leftover) sorted = await bin_insert(sorted, leftover, cmp)
  return sorted
}

// Reads all the images and returns a promise array of img elements
function read_all(images) {
  return Promise.all(
    [...images].map(v => new Promise(res => {
      const reader = new FileReader()
      reader.onload = e => res(`<img src="${e.target.result}"/>`)
      reader.readAsDataURL(v)
    }))
  )
}

// Compares two images using the user (returns a promise)
function img_cmp(img1, img2) {
  return new Promise(res => {
    $("#img1").html(img1).click(() => res(true))
    $("#img2").html(img2).click(() => res(false))
  })
}

// Hide the image stuff before the images get selected
$("#img_questions,#img_results").hide()

// Image sort
$("#in_images").change(e => {
  $("#img_results").hide().children(".card").remove()
  $("#img_questions").show()
  read_all(e.target.files)
    .then(v => fj_sort(v, img_cmp))
    .then(v => {
      $("#img_questions").hide()
      $("#img_results").show().append(
        v.map(v2 => `<div class="card col s12 m6 xl4"><div class="card-image">${v2}</div></div>`)
      )
    })
})

// Compares two texts using the user (returns a promise)
function text_cmp(text1, text2) {
  return new Promise(res => {
    $("#text1").text(text1).click(() => res(true))
    $("#text2").text(text2).click(() => res(false))
  })
}

// Hide the text stuff before the text gets selected
$("#text_questions,#text_results").hide()

// Text Sort
$("#sort_text").click(e => {
  $("#text_results").hide().children("p").remove()
  $("#text_questions").show()
  fj_sort($("#in_text").val().split(/\s*\\\\\s*/), text_cmp)
    .then(v => {
      $("#text_questions").hide()
      $("#text_results").show().append(
        v.map(v2 => `<p class="flow-text hoverable">${v2}</p>`)
      )
    })
})

function site_cmp(site1, site2) {
  return new Promise(res => {
    $("#frame1").attr("src", site1)
    $("#frame2").attr("src", site2)
    $("#site1").click(() => res(true))
    $("#site2").click(() => res(false))
  })
}

$("#site_questions,#site_results").hide()

$("#sort_sites").click(e => {
  $("#site_results").hide().children("a").remove()
  $("#site_questions").show()
  fj_sort($("#in_sites").val().split("\n"), site_cmp)
    .then(v => {
      $("#site_questions").hide()
      $("#site_results").show().append(
        v.map(v2 => `<a href="${v2}" class="flow-text hoverable" style="display: block;">${v2}</a>`)
      )
    })
})