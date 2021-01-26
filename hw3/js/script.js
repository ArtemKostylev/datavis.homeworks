const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создайте симуляцию с использованием forceCenter, forceX и forceCollide
const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter().x(b_width / 2).y(b_height / 2))
    

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    x.domain([d3.min(years), d3.max(years)])
    radius.domain([d3.min(rating), d3.max(rating)])
    color.domain([d3.min(ratings), d3.max(ratings)])


    // Part 1 - создайте circles на основе data
    var nodes = bubble
        .selectAll("circle")
        .data(data)
        .enter()
        .append('circle')
        .attr("r", 2)
        .attr("cx", function(d) {return x(d['release year'])})
        .attr("cy", b_height / 2)
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .style("stroke-width", "0px")
        .on('mouseover', overBubble)
        .on('mouseout', outOfBubble);

    
    // Part 1 - передайте данные в симуляцию и добавьте обработчик события tick
    simulation.nodes(data)
    .force('collision', d3.forceCollide().radius(function(d) {
        return radius(d['user rating score']);
      }))
      .force('x', d3.forceX().x(function(d) {
        return x(d['release year']);
      }))
        .on("tick", function(d){
            nodes
            .attr("r", function(d) {
                return radius(d['user rating score'])
            })
            .attr("cx", function(d){ return d.x; })
            .style("fill", function(d) {
                return color(d['rating'])
            })
            .attr("cy", function(d){ return d.y; })
        });

    var radius_ = Math.min(d_width, d_height) / 2 
    var pie = d3.pie()
        .value(function(d) {return d.value; })
    var data_ready = pie(ratings)


    donut
        .selectAll('arcs')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(100)        
            .outerRadius(radius_)
        )
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", 2)
        .style("opacity", 0.7)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){
        console.log(d.x, d.y)
        d3.select(this).attr('stroke', 'black').style("stroke-width", 2)
        tooltip.text(d.title)
        tooltip.style('display', 'inline')
		.style('top', d.y + "px")
        .style('left', d.x + "px")
        
    }
    function outOfBubble(){
        d3.select(this).attr('stroke', 'black').style("stroke-width", 0)
            
        tooltip.style('display', 'none')
    }

    function overArc(da){
        console.log(da)
        donut_lable.text(da.data.key)
        d3.select(this).style('opacity', 0.3)

        circles = d3.selectAll('circle').filter(function (d) {return d.rating!=da.data.key;}).style('opacity', 0.3)

    }
    function outOfArc(){
        donut_lable.text('')
        d3.select(this).style('opacity', 1)
        d3.selectAll('circle').style('opacity', 1)
    }
});