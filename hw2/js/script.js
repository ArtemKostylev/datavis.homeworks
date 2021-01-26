const width = 1000;
const height = 500;
const margin = 30;
const svg  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let radius = 'gdp';
let year = '2000';

const params = ['child-mortality', 'fertility-rate', 'gdp', 'life-expectancy', 'population'];
const colors = ['aqua', 'lime', 'gold', 'hotpink']

// Шкалы для осей и окружностей
const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);
const r = d3.scaleLinear().range([5, 15])
const color = d3.scaleOrdinal().range(colors)

const xLable = svg.append('text').attr('transform', `translate(${width/2}, ${height})`);
const yLable = svg.append('text').attr('transform', `translate(${margin/2}, ${height/2}) rotate(-90)`);

const xAxis = svg.append('g').attr('transform',`translate(0,${height-30})`);
const yAxis = svg.append('g').attr('transform',`translate(${margin *2 }, 0)`);


// Part 2: для элемента select задайте options (http://htmlbook.ru/html/select) и установить selected для начального значения
d3.select('#radius').selectAll('option')
    .data(params)
    .enter()
    .append('option')
    .text(d => {return d})
    .attr('value', function (d){return d})
    .attr('selected', d => {if (d == 'gdp') return true})
//         ...
d3.select('#x').selectAll('option')
    .data(params)
    .enter()
    .append('option')
    .text(d => {return d})
    .attr('value', function (d){return d})
    .attr('selected', d => {if (d == 'fertility-rate') return true})

d3.select('#y').selectAll('option')
    .data(params)
    .enter()
    .append('option')
    .text(d => {return d})
    .attr('value', function (d){return d})
    .attr('selected', d => {if (d == 'child-mortality') return true})

// Part 3: select с options для осей
// ...


loadData().then(data => {

    console.log(data)

    d3.select('.slider').on('change', newYear);

    d3.select('#radius').on('change', newRadius);

    d3.select('#x').on('change', newX);

    d3.select('#y').on('change', newY);

    // Part 3: подпишитесь на изменения селекторов параметров осей
    // ...

    function newYear(){
        year = this.value;
        updateChart()
    }

    function newRadius(){
        radius = this.value
        updateChart()
    }

    function newX(){
        xParam = this.value
        updateChart()
    }

    function newY(){
        yParam = this.value
        updateChart()
    }

    function updateChart(){
        console.log('updating')
        xLable.text(xParam);
        yLable.text(yParam);
        d3.select('.year').text(year);

        // поскольку значения показателей изначально представленны в строчном формате преобразуем их в Number при помощи +
        let xRange = data.map(d=> +d[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)]);

        xAxis.call(d3.axisBottom(x));    

        let yRange = data.map(d=> +d[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)]);

        yAxis.call(d3.axisLeft(y));    

        let rRange = data.map(d => +d[radius][year]);
        r.domain([0, d3.max(rRange)]);

        let regions = data.map(d => d['region'])
        color.domain([...new Set(regions)])

        let circle = svg.selectAll('circle').data(data).enter().append('circle')

        console.log(circle)

        circle = svg.selectAll('circle').data(data)
        circle.attr("r", function(d) {
            return r(d[radius][year])
        }).attr("cx", function(d) {
            return x(d[xParam][year])
        }).attr("cy", function(d) {
            return y(d[yParam][year])
        }).style("fill", function(d) {
            return color(d['region'])
        })
        //     ...
    }

    updateChart();
});


async function loadData() {
    const population = await d3.csv('data/pop.csv');
    const rest = { 
        'gdp': await d3.csv('data/gdppc.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expect.csv'),
        'fertility-rate': await d3.csv('data/tfr.csv')
    };
    const data = population.map(d=>{
        return {
            geo: d.geo,
            country: d.country,
            region: d.region,
            population: {...d},
            ...Object.values(rest).map(v=>v.find(r=>r.geo===d.geo)).reduce((o, d, i)=>({...o, [Object.keys(rest)[i]]: d }), {})
            
        }
    })
    return data
}