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

// Reads all given images and returns a promise array of dataurls
function read_all(images) {
  return Promise.all(
    [...images].map(v => new Promise(res => {
      const reader = new FileReader()
      reader.onload = e => res(e.target.result)
      reader.readAsDataURL(v)
    }))
  )
}

const { createApp } = Vue
const app = createApp({
  data() { return {
    sortable: ['Numbers', 'Images', 'Text', 'Websites'],
    sorting: '',
    Numbers: {
      text: ''
    },
    Images: {
      left: {
        url: '',
        ret: () => {}
      },
      right: {
        url: '',
        ret: () => {}
      },
      is_sorting: false,
      sorted_urls: []
    },
    Text: {
      text: '',
      left: {
        text: '',
        ret: () => {}
      },
      right: {
        text: '',
        ret: () => {}
      },
      is_sorting: false,
      sorted_text: []
    },
    Websites: {
      links: '',
      sorted_sites: [],
      is_sorting: false,
      left: {
        url: '',
        ret: () => {}
      },
      right: {
        url: '',
        ret: () => {}
      },
    }
  }},
  computed: {
    sorted_numbers() {
      nums = this.Numbers.text.match(/-?(\d+(\.\d+)?|\.\d+)/g)
      if (!nums) return ''
      return nums.sort((a, b) => a - b).reduce((a, v) => a + ", " + v)
    }
  },
  methods: {
    async image_upload(event) {
      urls = await read_all(event.target.files)
      this.Images.sorted_urls = []
      this.Images.sorted_urls = await fj_sort(urls, (a, b) => this.image_cmp(a, b))
    },
    image_cmp(i_left, i_right) {
      this.Images.left.url = i_left
      this.Images.right.url = i_right
      this.Images.is_sorting = true
      return new Promise(res => {
        this.Images.left.ret = () => {
          res(true)
          this.Images.is_sorting = false
        }
        this.Images.right.ret = () => {
          res(false)
          this.Images.is_sorting = false
        }
      })
    },
    async text_sort() {
      this.Text.sorted_text = []
      this.Text.sorted_text = await fj_sort(this.Text.text.split(/\s*\\\\\s*/), (a, b) => this.text_cmp(a, b))
    },
    text_cmp(t_left, t_right) {
      this.Text.left.text = t_left
      this.Text.right.text = t_right
      this.Text.is_sorting = true
      return new Promise(res => {
        this.Text.left.ret = () => {
          res(true)
          this.Text.is_sorting = false
        }
        this.Text.right.ret = () => {
          res(false)
          this.Text.is_sorting = false
        }
      })
    },
    async website_sort() {
      this.Websites.sorted_sites = []
      this.Websites.sorted_sites = await fj_sort(this.Websites.links.split('\n'), (a, b) => this.site_cmp(a, b))
    },
    site_cmp(s_left, s_right) {
      this.Websites.left.url = s_left
      this.Websites.right.url = s_right
      this.Websites.is_sorting = true
      return new Promise(res => {
        this.Websites.left.ret = () => {
          res(true)
          this.Websites.is_sorting = false
        }
        this.Websites.right.ret = () => {
          res(false)
          this.Websites.is_sorting = false
        }
      })
    }
  }
}).mount('#app')