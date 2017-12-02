import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './vis.css'
const d3 = require('d3')

class Draggable extends Component {
    static defaultProps = {
        // allow the initial position to be passed in as a prop
        initVal: 0,
        min:0,
        max:70,
        callback: ()=>console.log('no callback'),
        widthVal:70,
        width:468,
        offsetVert: '-5px'

    }
    getPos = (val) => this.props.width/this.props.widthVal*val-10
    getVal = (pos) => Math.round(this.props.widthVal/this.props.width*(pos+10))
    state = {
        pos: {x:this.getPos(this.props.initVal)},
        dragging: false,
        rel: null, // position relative to the cursor
        value: this.props.initVal,

    }
    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    // etc.



    componentDidUpdate = (props, state) => {
      if (this.state.dragging && !state.dragging) {
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('mouseup', this.onMouseUp)
      } else if (!this.state.dragging && state.dragging) {
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
      }
    }
  
    // calculate relative position to the mouse and set dragging=true
    onMouseDown = (e)=>{
      // only left mouse button
      if (e.button !== 0) return
      var pos = {left:e.target.offsetLeft}
      this.setState({
        dragging: true,
        rel: {
          x: e.pageX - pos.left,
        //   y: e.pageY - pos.top
        }
      })
      e.stopPropagation()
      e.preventDefault()
    }
    onMouseUp = (e) => {
      this.setState({dragging: false})
      e.stopPropagation()
      e.preventDefault()
    }
    onMouseMove = (e) => {
        console.log(this.props.width)
      if (!this.state.dragging) return
      let result = e.pageX - this.state.rel.x
      if (result > this.getPos(this.props.max)) result = this.getPos(this.props.max)-1
      if (result < this.getPos(this.props.min)) result = this.getPos(this.props.min)+1
      this.setState({
        pos: {
          x: result,
        //   y: e.pageY - this.state.rel.y
        },
        value: this.getVal(result)

      })
      this.props.callback(this.getVal(result))
      e.stopPropagation()
      e.preventDefault()
    }
    render() {
      // transferPropsTo will merge style & other props passed into our
      // component to also be on the child DIV.
      return (<div
        className={'slider-dot'}
        onMouseDown={this.onMouseDown}
        style={{
          position: 'absolute',
          left: this.state.pos.x + 'px',
          top: this.props.offsetVert,
          width:'20px',
          height:'20px',
          borderRadius:'10px',
          backgroundColor: '#D1EDD3',
        }}>
        {this.state.value}
        </div>
      )
    }
  }
  



class Slider extends Component {
    state = {
        from: 6,
        to: 10,
        fromPosX: 0,
        isDown: false,
    }

    componentDidMount = () =>{
        this.setState({barWidth:this.refs.bar.clientWidth})
        console.log(this.state.barWidth)



        // setInterval(() => this.setState({ from: this.state.from + 10 }), 1000)

    }

    mouseDown = (e) => {
        this.setState({ isDown: true })
        // this.setState({ fromPosX: e.pageX })
        // console.log(this.state.fromPosX)
        this.props.callback(this.state.from,this.state.to)
    }
    mouseUp = (e) => {
        this.setState({ isDown: false })
        this.props.callback(this.state.from,this.state.to)
    }

    mouseMove = (e) => {
        e.stopPropagation()
        if (this.state.isDown) {
                this.setState({ fromPosX: e.clientX - e.target.offsetLeft })
                // console.log(this.state.fromPosX)
            
        }

    }

    setToValue = (to) => {
        this.setState({to})
        this.props.callback(this.state.from,this.state.to)
    }
    setFromValue = (from) => {
        this.setState({from})
        this.props.callback(this.state.from,this.state.to)
        
    }





    render() {
        return (
            <div className='slider'
            >
                <div ref="bar" className='slider-bar'
                     ></div>
                <Draggable offsetVert={'-15px'} initVal={this.state.from} max={this.state.to} callback={this.setFromValue} width={this.state.barWidth}/>
                <Draggable offsetVert={'5px'} initVal={this.state.to} min={this.state.from}  callback={this.setToValue} width={this.state.barWidth}/>

                {/* <div className='slider-dot'

                    style={{ transform: `translate(${this.state.fromPosX}px,0px)` }}
                    onMouseDown={this.mouseDown}
                    onMouseMove={this.mouseMove}
                    onMouseUp={this.mouseUp}>
                    {this.state.fromPosX}
                    
                </div> */}
            </div>
        )
    }
}

class BarChart extends Component {
    


    render() {
        if(!this.props.bars || !this.props.bars.length) return false
        console.log('barsbars')
        let yscale = d3.scaleLinear()
            .domain(d3.extent(this.props.bars,d=>d.val))
            .range([20,60])

        console.log(yscale(this.props.bars[0].val))

        return(
            <g transform={`translate(10,0)`}>
            {this.props.bars.slice(0,3).map((bar,i)=>{
                return <g
                transform={`translate(${i*12},${-yscale(bar.val)+100})`}
                ><rect
                    width={10}
                    height={yscale(bar.val)}
                    fill={this.props.colors[i]}
                ></rect>
                <text
                fontSize={3}
                transform={'translate(0,-2)'}
                textAnchor={'start'}>{bar.name}</text>
                
                </g>
            })}
            </g>
        )
    }
}

class People extends React.Component {
    render() {
        return (
            <g transform={'translate(160,10)'}>
                <text fontSize={4} transform={'translate(-10,-2)'}>Samples: {this.props.count}</text>
                {(Array(Math.round(this.props.count/100))||1).fill().map((d,i)=> 
                        <circle
                        cx={Math.round(Math.random()*5)}
                        cy={Math.round(Math.random()*5)}
                        fill={'salmon'}
                        r={.5}
                        ></circle>
                    )
                }
            </g>
        )
    }
}


class Vis extends Component {

    static defaultProps = {
        height: 100,
        width: 200,
    }

    state = {
        from:0,
        to:100
    }

    componentDidMount() {
        // setInterval(()=>{this.setState({from:this.state.from+10}); console.log('update')},1000)
    }

    updateGraph = (from,to) => {
        if (from !== this.state.from || to !== this.state.to)
        this.setState({from,to})
        
    }
    
    renderGraph = (d) => {
        console.log(d)

    }

   

    render() {
        console.log('updateGraph')
        if (!this.props.dataset) return <div></div>
        let dataset = this.props.dataset
        let categories = this.props.categories
        let width = this.props.width
        let height = this.props.height
        let colors = this.props.colors




        let radius = 40
        let arc = d3.arc()
            // .startAngle(d => 10)
            // .endAngle(d => 100)
            .innerRadius(d => 5)
            .outerRadius(d => radius)


        let ages = [this.state.from, this.state.to]
        // console.log(dataset)
        let filteredData = dataset.filter(d => d["Q3_AGE"] >= ages[0] && d["Q3_AGE"] <= ages[1])

        // console.log(categories)
        let catData = Object.keys(categories).map(cat => {
            // console.log(categories[cat])
            let retCat = categories[cat].trim().split(/[ \n]+/g).map(candy => {
                let retCandy = {}
                retCandy.score = !filteredData.length? 0: filteredData.reduce((a, b) => ({ [candy]: scoreMap(a[candy]) + scoreMap(b[candy]) }))[candy]
                retCandy.key = candy
                retCandy.name = candy.slice(3).replace(/_/g, ' ')
                // console.log(retCandy.score)
                return retCandy
            })

            retCat.score = retCat.reduce((a, b) => ({ score: a.score + b.score })).score/1386*100/retCat.length
            // console.log(retCat.score)
            retCat.key = cat
            return retCat
        })

        // console.log(catData)

        let pie = d3.pie()
            .sort(null)
            .value(d => { return d.score })
            (catData.slice(1))


        var label = d3.arc()
            .outerRadius(radius + 8)
            .innerRadius(radius + 5)

        let arcs = null

        catData.forEach(cat => {
            if (this.state.render === cat.key) {
                pie = d3.pie()
                .sort(null)
                .value(d => { return d.score })
                (cat)
                arcs = pie.map((d, i) => {
                    // console.log(d)
                    // let pos = 0;
                    // if (this.state.render === d.data.key) {
                    //     d.endAngle = 10
                    //     d.startAngle=0
                    //     pos = 1
                    // }
                    return <g transform={`translate(${100},${50})`} mykey={i} fill="#222" key={i}
                    onClick={()=>{
                        this.setState({render: d.data.key})
                        console.log(d)
                    }}>
                        <path className={'graph-arc'} fill={colors[i % colors.length]} d={arc(d)} />
                    
                        <text
                        fontSize={3}
                        transform={`translate(${label.centroid(d)[0]-5},${label.centroid(d)[1]})`}>
                            {d.data.name}
                        </text>
                        {/* arcs
                .append("text")
                .attr("transform", function (d) { return "translate(" + + ")"; })
                .attr('font-size', 3)
                .attr("dy", "0.35em")
                .text(function (d) { return d.data.catName; })
                .attr('text-anchor', 'start')
                .translate(d => [label.centroid(d)[0] - 5, label.centroid(d)[1]]) */}
                    </g>
                })
            }
        })
        
        if (arcs === null) 
        arcs = pie.map((d, i) => {
            // console.log(d)
            // let pos = 0;
            // if (this.state.render === d.data.key) {
            //     d.endAngle = 10
            //     d.startAngle=0
            //     pos = 1
            // }
            return <g transform={`translate(${100},${50})`} mykey={i} fill="#222" key={i}
            onClick={()=>{
                this.setState({render: d.data.key})
                console.log(d)
            }}>
                <path className={'graph-arc'} fill={colors[i % colors.length]} d={arc(d)} />
            
                <text
                fontSize={3}
                transform={`translate(${label.centroid(d)[0]-5},${label.centroid(d)[1]})`}>
                    {d.data.key}
                </text>
                {/* arcs
        .append("text")
        .attr("transform", function (d) { return "translate(" + + ")"; })
        .attr('font-size', 3)
        .attr("dy", "0.35em")
        .text(function (d) { return d.data.catName; })
        .attr('text-anchor', 'start')
        .translate(d => [label.centroid(d)[0] - 5, label.centroid(d)[1]]) */}
            </g>
        })
        // .sort((a,b)=>{console.log(a);return a.props.pos-b.props.pos})

        function scoreMap(score) {
            if (typeof score === "number") return score
            let pushVal = 0
            if (score === "JOY") pushVal = 1
            else if (score === "MEH") pushVal = 0
            else if (score === "DISPAIR") pushVal = -1
            return pushVal
        }

        let svg = <svg
            height='100%'
            width='100%'
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio='xMinYMin'>
            <BarChart />
            <rect
                fill={"whitesmoke"}
                width={width}
                height={height}
                onClick={()=>this.setState({render:'none'})}>
            </rect>
            {arcs}
            <BarChart bars={
                catData.slice(1).reduce((a,b)=>a.concat(b)).sort((a,b)=>b.score-a.score)
                    .slice(0,4).map(v=>{
                        return {
                            val:v.score,
                            name:v.name,
                        }
                    })
            } colors={this.props.colors}/>
            <People count={filteredData.length}/>

        </svg>

        return <div>
            {svg}
            <Slider callback={this.updateGraph}/>
        </div>
    }


}

export default Vis