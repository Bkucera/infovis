import React, { Component } from 'react';
import ReactFauxDom from 'react-faux-dom'
import Vis from './Vis'
// import * as d3 from 'd3'
import './App.css';
import './vis.css'
let candyIcon = require('./candy.svg')
const d3 = require('d3')

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      colors: ['#FCA799', '#FBBFA8', '#D1EDD3', '#8AE2D8', '#149E99'],
      dataset: false,
      categories: {
        "Any": `Q6_Any_full_sized_candy_bar`,
  
        "Chocolate":
          `Q6_Butterfinger
          Q6_Heath_Bar
          Q6_Hershey_s_Dark_Chocolate
          Q6_Hershey_s_Milk_Chocolate
          Q6_Hershey_s_Kisses
          Q6_Kit_Kat
          Q6_Milk_Duds
          Q6_Milky_Way
          Q6_Regular_M_Ms
          Q6_Peanut_M_M_s   
          Q6_Mr_Goodbar
          Q6_Nestle_Crunch
          Q6_Reese_s_Peanut_Butter_Cups   
          Q6_Reese_s_Pieces  
          Q6_Rolos
          Q6_Snickers   
          Q6_Three_Musketeers
          Q6_Tolberone_something_or_other 
          Q6_Twix
          Q6_Whatchamacallit_Bars`  ,
  
        "Gummy/Chewy Candies": `
        Q6_Dots
        Q6_Gummy_Bears_straight_up       
        Q6_Fuzzy_Peaches
        Q6_Sourpatch_Kids_i_e_abominations_of_nature
        Q6_Swedish_Fish      
        Q6_LaffyTaffy
        Q6_Starburst 
        Q6_Peeps
        `,
        
              "Bite-Sized": `
        Q6_Nerds
        Q6_Pixy_Stix
        Q6_Mike_and_Ike
        Q6_Candy_Corn         
        Q6_Skittles
        `,
  
        "Gum": `
        Q6_Chiclets
        `,
        
              "Hard Candy": `
        Q6_Lollipops
        Q6_Jolly_Rancher_bad_flavor           
        Q6_Jolly_Ranchers_good_flavor
        Q6_LemonHeads
        `,
              "Mints": `
        Q6_Junior_Mints       
        Q6_Mint_Kisses
        Q6_Tic_Tacs  
        Q6_York_Peppermint_Patties
        `,
              "Licorice": `
        Q6_Licorice_not_black          
        Q6_Licorice_yes_black
        Q6_Good_N_Plenty
        `,
              "Other": `
        Q6_Trail_Mix 
        Q6_Healthy_Fruit
        `
      }
    }

    d3.csv('candy.csv', (error, dataset) => {
      if (error) {
        console.error(error)
        return
      }
      console.log(dataset)
      this.setState({ dataset })

    })
  }



  componentWillMount() {
  }

  reactGraph = () => {
    if (!this.state.dataset) return
    let dataset = this.state.dataset
    let colors = this.state.colors
    let categories = this.state.categories

    let node = d3.select(ReactFauxDom.createElement('div'))
    let height = 200
    let width = 100
    let svg = node.append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${height} ${width}`)
      .attr('preserveAspectRatio', 'xMinYMin')

    let radius = 40
    let arc = d3.arc()
      // .startAngle(d => 10)
      // .endAngle(d => 100)
      .innerRadius(d => 5)
      .outerRadius(d => radius)

    svg.append('rect').attr('fill', 'whitesmoke')
      .attr('width', height)
      .attr('height', width)


    update()

    function update(ages = [0, 100]) {
      console.log(dataset)
      let filteredData = dataset.filter(d => d["Q3_AGE"] >= ages[0] && d["Q3_AGE"] <= ages[1])

      // console.log(categories)
      let catData = Object.keys(categories).map(cat => {
        // console.log(categories[cat])
        let retCat = categories[cat].trim().split(/[ \n]+/g).map(candy => {
          let retCandy = {}
          retCandy.score = filteredData.reduce((a, b) => ({ [candy]: scoreMap(a[candy]) + scoreMap(b[candy]) }))[candy]
          retCandy.key = candy
          retCandy.name = candy.slice(3).replace(/_/g, ' ')
          // console.log(retCandy.score)
          return retCandy
        })

        retCat.score = retCat.reduce((a, b) => ({ score: a.score + b.score })).score
        // console.log(retCat.score)
        retCat.key = cat
        return retCat
      })

      // console.log(catData)

      let pie = d3.pie()
        .sort(null)
        .value(d => { return d.score })
        (catData)


      var label = d3.arc()
        .outerRadius(radius + 8)
        .innerRadius(radius + 5)
      // .startAngle(4)

      let arcs = svg.selectAll('points').data(pie).enter()
        .append('g')
        .translate([100, 50])


      arcs
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors[i % colors.length])
        .each(function (d) { d._current = d })



      arcs
        .append("text")
        .attr("transform", function (d) { return "translate(" + + ")"; })
        .attr('font-size', 3)
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.catName; })
        .attr('text-anchor', 'start')
        .translate(d => [label.centroid(d)[0] - 5, label.centroid(d)[1]])



      function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
          return arc(i(t));
        };
      }

      function labelarcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
          return "translate(" + label.centroid(i(t)) + ")";
        };
      }


    }

    function scoreMap(score) {
      if (typeof score === "number") return score
      let pushVal = 0
      if (score === "JOY") pushVal = 1
      else if (score === "MEH") pushVal = 0
      else if (score === "DISPAIR") pushVal = -1
      return pushVal
    }




    return node.node().toReact()


    // var svg = d3.select('.chart-container').append("svg")
    // .attr("width", '100%')
    // .attr("height", '100%')
    // .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    // .attr('preserveAspectRatio','xMinYMin')
    // .append("g")
    // .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");
  }

  renderSlider() {
    let node = d3.select(ReactFauxDom.createElement('span'))
    let height = 100
    let width = 10
    let svg = node.append('svg')
      .attr('width', '70%')
      .attr('height', '70%')
      .attr('viewBox', `0 0 ${height} ${width}`)
      .attr('preserveAspectRatio', 'xMinYMin')


    svg.append('rect').attr('fill', this.state.colors[2])
      .attr('width', height)
      .attr('height', width)

    let bar = svg.append('g')
      .translate([5, 4])

    bar.append('rect')
      .attr('width', 90)
      .attr('height', 2)
      .attr('fill', this.state.colors[1])
      // .attr('border-radius', '90')

    let from = [{ x: 6 }]
    let to = [{ x: 7 }]

    // let ball1 = bar.append('g').data(from)
    let ball1 = bar
      .append('g')
      .selectAll('circle')
      .data(from)
      .enter()
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 1)
      .attr('r', 2)
      .attr('fill', this.state.colors[0])
      .translate(d => [d.x, 0])


    let ball2 = bar.selectAll('.sdf').data(to).enter()
      .append('circle')
      .attr('cx', 40)
      .attr('cy', 1)
      .attr('r', 2)
      .attr('fill', this.state.colors[0])
      .transition().duration(300)
      .attr('fill','#333')
      .attr('cx',400)

    ballUpdate()

    function ballUpdate() {

    }


    let drag = d3.drag().on('drag', onDrag);
    ball1.call(drag)
    // ball1.call(dragBehavior);

    function onDrag(d) {
      console.log(d3.event.sourceEvent.x)
      console.log(d3.select(this))
      // var x = d3.event.sourceEvent
      d3.select(this).translate([d3.event.sourceEvent.x, 0])
      // d3.select(this).attr('fill',"#333")
    }

    return node.node().toReact()
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">D3 below</h1>
        </header>
        {/* {this.reactGraph()} */}
        {/* {this.renderSlider()} */}
        <Vis dataset={this.state.dataset}
          colors={this.state.colors}
          categories={this.state.categories}/>
      </div>
    );
  }
}

export default App;
