  /** @jsx React.DOM */                                                     

var React = require('react');                             
var Input = require('react-bootstrap/Input');                             

var myForm = React.createClass({
  getInitialState: function () {
    return {data: []};
  },

  render: function () {
    return (
          <Input id="username" name="username" type="text"                  
              label="username"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-5" />
          <Input id="password" name="password" type="password"              
              label="password"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-5" />
            <Input type="checkbox" label="remember me"
              wrapperClassName="col-xs-offset-2 col-xs-10" />
        <Input type="submit" bsStyle='primary' value="Submit button" />   
    );
  }
});
module.exports = myForm;
