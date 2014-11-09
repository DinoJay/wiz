var React = require('react'); 
var DataTable = require('react-data-components').DataTable;                
var columns = [
  { title: 'Article', prop: 'article'  },
  { title: 'id', prop: 'id' }
];

var my_grid = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
  },
  componentWillReceiveProps: function(nextProps) {
    var el = this.getDOMNode();
    React.unmountComponentAtNode(el);

    this.forceUpdate();
    console.log("NEW PROPS");
  },
  render: function() {
    return (
      <div> 
      <DataTable id="dt"
      className="container"
      keys={[ 'name', 'address' ]}
      columns={columns}
      initialData={this.props.data }
      initialPageLength={5}
      initialSortBy={{ prop: 'city', order: 'desc' }}
      pageLengthOptions={[ 5, 20, 50 ]}
      />
      </div>
    );
  },
  componentWillUnmount: function() {
    var el = this.getDOMNode();
    //d3Chart.destroy(el);
  }
});

module.exports = my_grid;
