import { Component } from 'react';
export default class ErrorBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="not-found" role="alert"><h1>Something interrupted your visit.</h1><p>Reload the page to try again. If this keeps happening, contact your clinic administrator.</p><button className="btn btn-primary" onClick={()=>window.location.reload()}>Reload page</button></div>:this.props.children;}
}
