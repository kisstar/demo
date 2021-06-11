function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrappedComponent) {
    return class extends React.Component {
      static contextType = ReactReduxContext;

      componentDidMount() {
        const updateState = () =>
          this.setState(mapStateToProps(this.context.store.getState()));
        updateState();
        this.unsubscribe = this.context.store.subscribe(updateState);
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      render() {
        let actions = {};

        if (typeof mapDispatchToProps === 'function') {
          actions = mapDispatchToProps(this.context.store.dispatch);
        } else if (
          mapDispatchToProps &&
          typeof mapDispatchToProps === 'object'
        ) {
          actions = bindActionCreators(
            mapDispatchToProps,
            this.context.store.dispatch
          );
        }

        return <WrappedComponent {...this.state} {...actions} />;
      }
    };
  };
}
