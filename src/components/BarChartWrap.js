import React from 'react';
import Axios from 'axios';
import {BarChart} from 'react-d3-components';
import {Button} from 'semantic-ui-react';
import PropTypes from 'prop-types';

var prefix = "http://localhost:3001/api"

export default class BarChartWrap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {records: [], variables: [], groupbyindicator: true};
    }

    getData = () => {
        Axios.get(prefix + `/v1/data/${this.props.year}`).then((response) => {
            console.log(response);
            const data =  response.data;
            var records = data.filter((x)=>{
                return (this.props.countries).includes(x.ISO3)
            })
            this.setState({
                records : records 
            })
            console.log(records)
                        
        })
    }

    getVariables = () => {
        var ind = this.props.indicators.filter((x) => {
            return (x != null);
        })
        Axios.post(`http://localhost:3001/api/v1/categories/${this.props.year}`, ind). then((res) => {
            console.log(res.data)
            this.setState({
                variables : res.data
            })
        })
    }

    componentDidMount = () => {
        this.getData()
        this.getVariables()
    }

    componentWillReceiveProps = (nextProps, nextState) => {
        console.log('cur',this.props)
        console.log('nxt', nextProps)
        var update = nextProps.year !== this.props.year 
            || nextProps.indicators.length !== this.props.indicators.length
            || nextProps.countries.length !== this.props.countries.length
        console.log(update)
        if(update) {
            this.getData()
            this.getVariables()
        }
    }


    tooltip = function(x, y0, y, total) {
        return "Score: " + y.toString();
    }

    labelAccessor = function(stack) { return stack.customLabel };
    
    toggleGroup = () => {
        this.setState({groupbyindicator: !this.state.groupbyindicator});    
    }

    render() {
        if(this.state.variables.length === 0) return null;
        if(this.state.records.length === 0) return null;
        const colors = ['RGB(31,119,180)','RGB(179,199,229)','RGB(239,133,54)','RGB(245,189,130)','RGB(81,157,62)','RGB(168,220,147)','RGB(197,57,50)','RGB(241,157,153)','RGB(141,107,184)','RGB(193,177,210)','RGB(133,88,78)','RGB(190,157,150)','RGB(213,126,190)','RGB(237,185,209)','RGB(127,127,127)','RGB(199,199,199)','RGB(188,188,69)','RGB(219,218,150)','RGB(88,188,204)','RGB(170,117,227)','RGB(58,119,175)'];
        var ind = this.props.indicators.filter((x) => {
            return (x != null);
        })
        console.log(ind);

        if (this.state.groupbyindicator) {
            var xlabel = 'Indicator';
            var data = [];
            for (var i=0; i < this.state.records.length; i++) {
                var scorelst = [];
                for (var n=0; n < ind.length; n++){
                    if (ind[n].length == 5) {
                        scorelst.push({x: this.state.variables[n], y: parseInt(this.state.records[i][ind[n]+'score'])});
                    } else {
                        scorelst.push({x: this.state.variables[n], y: parseInt(this.state.records[i][ind[n]+'score'])});
                    }
                    
                }
                data.push({label: this.state.records[i].ISO3, values: scorelst});
            }

                var legend = '<ul>';
                for (var i=0; i < this.state.records.length; i++) {
                    legend += '<li style= color:'+ colors[i%20] +';font-weight:900>' + this.state.records[i].Economy + '</li>';
                }
                legend += '</ul>';
            } else {      
                var xlabel = 'Country';         
                var data = [];
                for (var i=0; i < this.state.variables.length; i++) {
                    var scorelst = [];
                    for (var n=0; n < this.state.records.length; n++){
                        if (this.props.indicators[i].length == 5) {
                            scorelst.push({x: this.state.records[n].ISO3, y: parseInt(this.state.records[n][ind[i]+'score'])});
                        } else {
                            scorelst.push({x: this.state.records[n].ISO3, y: parseInt(this.state.records[n][this.props.indicators[i]+'score'])});
                        }
                            
                    }
                    data.push({label: this.state.variables[i], values: scorelst});
                }
        
                      var legend = '<ul>';
                    for (var i=0; i < this.state.variables.length; i++) {
                        legend += '<li style= color:'+ colors[(i+this.state.records.length)%20] +';font-weight:900>' + this.state.variables[i] + '</li>';
                    }
                    legend += '</ul>';
                }

        return(
            <div>
                <div style={{padding:'10px'}}>
                    <h1> BarChart Comparison </h1>
                </div>
            <div className = 'barChart' >
                <BarChart
                groupedBars
                axes
                data={data}
                width={this.props.width?this.props.width:1000}
                height={this.props.height?this.props.height:500}
                padding={this.props.padding?this.props.padding:0}
                margin={{top: 10, bottom: 50, left: 50, right: 10}}
                tooltipHtml={this.tooltip}
                tooltipMode={'fixed'}
                tooltipOffset={{top: 5, left: 60}}
                xAxis={{label: xlabel}}
                yAxis={{label: "Score"}}
                style={{float:'left'}}/>
            </div>
                {/*<div>
                    <Button class="ui toggle button" role="button" color='red' onClick = {this.toggleGroup}>Toggle Grouping</Button>
                    <h3 > Legend </h3>
                    <div dangerouslySetInnerHTML={{__html: legend}} />
                </div>*/}
           </div>
        )
    }
}

BarChartWrap.propTypes = {
    year : PropTypes.string.isRequired,
    countries : PropTypes.arrayOf(PropTypes.string).isRequired,
    indicators : PropTypes.arrayOf(PropTypes.string).isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    padding: PropTypes.number,
}