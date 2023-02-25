import { timeConverter, formatBytes } from './helpers/index.js'

const body = document.querySelector('body')
const root = document.querySelector('.root')
const upDate = document.querySelector('.upDate')
const clearAllCreateTreeList = document.querySelector('.clearAllCreateTreeList')
const categ = document.querySelector('.categ')
const date = document.querySelector('.date')
const name = document.querySelector('.name')
const size = document.querySelector('.size')

const mass = JSON.parse(localStorage.getItem('massCards')) || []
const row = 18

const loader = document.querySelector('.lds-ellipsis')

let currentPage = localStorage.getItem('currentPage') || 0

if (!mass.length) {
    getDataFromFetch()
} else {
    drawCards(mass)
    console.log(mass)
}

function getDataFromFetch() {
    loader.style.display = 'block'
    const url = 'https://json-2afae-default-rtdb.firebaseio.com/.json'
    fetch(url)
        .then(data => data.json())
        .then(data => {
            loader.style.display = 'none'
            mass.push(...data)
            drawCards(mass)
        })
}

function displayPagination(arrData) {
    const pagesCount = Math.ceil(arrData.length / row)
    const ulEl = document.createElement('ul')
    ulEl.classList.add('pagination__list')

    for (let i = 0; i < pagesCount; i++) {
        const liEl = displayPaginationBtn(i + 1)
        ulEl.append(liEl)
    }
    root.append(ulEl)
    const numbers = document.querySelectorAll('.pagination__item')
    numbers.forEach(item => {
        if (item.dataset.id == currentPage) {
            item.classList.add('pagination__item--active')
        } else {
            item.classList.remove('pagination__item--active')
        }
    })

    localStorage.setItem('massCards', JSON.stringify(mass))
}

function displayPaginationBtn(page) {
    const liEl = document.createElement('li')
    liEl.classList.add('pagination__item')
    liEl.innerText = page
    liEl.setAttribute('data-id', page - 1)

    liEl.addEventListener('click', () => {
        currentPage = page - 1
        clearScreen()
        localStorage.setItem('currentPage', currentPage)
        const ulEl = document.querySelector('.pagination__list')
        ulEl.remove()
        displayList(mass)
        displayPagination(mass)
    })

    return liEl
}

function displayList(arrData) {
    const start = row * currentPage
    const end = start + row
    const massCards2 = arrData.slice(start, end)
    console.log()

    massCards2.forEach(element => {
        const card = document.createElement('div')
        card.classList.add('card')
        root.append(card)

        card.innerHTML = `<div class="card">
        <button class="delete" data-tm="${element.timestamp}">&times;</button>
        <img
            src="http://contest.elecard.ru/frontend_data/${element.image}"
            alt=""
        />
        <p>${element.image} <br />
        Размер файла: ${formatBytes(element.filesize)} <br />
        ${timeConverter(element.timestamp)}</p>
    </div>`

        const bntDelete = card.querySelector('.delete')

        bntDelete.addEventListener('click', event => {
            const newMass = mass.filter(
                item => item.timestamp != event.target.dataset.tm
            )
            mass.splice(0)
            mass.push(...newMass)

            localStorage.setItem('massCards', JSON.stringify(mass))
            card.remove()
            const ulEl = document.querySelector('.pagination__list')
            ulEl.remove()
            clearScreen()

            displayList(arrData)
            displayPagination(arrData)
        })
    })
}

function drawCards(massCards) {
    loader.style.display = 'none'
    displayList(massCards)
    displayPagination(massCards)
}

upDate.addEventListener('click', () => {
    categ.checked = true
    currentPage = 0

    clearScreen()

    const ulEl = document.querySelector('.pagination__list')
    ulEl.remove()

    mass.splice(0)
    getDataFromFetch()
})

clearAllCreateTreeList.addEventListener('click', () => {
    while (body.firstChild) {
        body.removeChild(body.firstChild)
    }
    treeList()
})

function clearScreen() {
    const cards = document.querySelectorAll('.card')
    cards.forEach(element => {
        element.remove()
    })

    localStorage.clear()
}

function sorting(sortType) {
    switch (sortType) {
        case 'category':
            mass.sort((a, b) => a.category.localeCompare(b.category))
            break
        case 'timestamp':
            mass.sort((a, b) => a.timestamp - b.timestamp)
            break
        case 'image':
            mass.sort((a, b) => b.image.localeCompare(a.image))
            break
        case 'filesize':
            mass.sort((a, b) => a.filesize - b.filesize)
            break
    }
    const ulEl = document.querySelector('.pagination__list')
    ulEl.remove()
    clearScreen()
    drawCards(mass)
}

categ.addEventListener('change', () => sorting('category'))

date.addEventListener('change', () => sorting('timestamp'))

name.addEventListener('change', () => sorting('image'))

size.addEventListener('change', () => sorting('filesize'))

function treeList() {
    const url = 'https://json-2afae-default-rtdb.firebaseio.com/.json'
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            let uniqueCategories = [...new Set(data.map(item => item.category))]

            let result = uniqueCategories.map(category => {
                return data.filter(item => item.category === category)
            })
            console.log(result)
            const main = document.createElement('details')
            const main_summaru = document.createElement('summary')
            body.append(main)
            main.append(main_summaru)
            main_summaru.innerHTML = 'root'
            for (let i = 0; i < result.length; i++) {
                const ulElement = document.createElement('details')
                const ulElementS = document.createElement('summary')
                ulElementS.innerText = `${result[i][0].category}`

                for (let j = 0; j < result[i].length; j++) {
                    const liElement = document.createElement('details')
                    const liElementS = document.createElement('summary')
                    const imageSize = document.createElement('img')
                    imageSize.src = `http://contest.elecard.ru/frontend_data/${result[i][j].image}`
                    imageSize.addEventListener('click', () => {
                        imageSize.classList.toggle('imgSizeUp')
                    })

                    liElementS.innerText = `${result[i][j].image}`

                    liElement.append(liElementS)
                    liElement.append(imageSize)
                    ulElement.append(liElement)
                }

                ulElement.append(ulElementS)
                main.append(ulElement)
            }
        })
}
