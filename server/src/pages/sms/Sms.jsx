import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock,
} from 'react-bootstrap';
import { LoaderContainer, Switch } from '@shoutem/react-web-ui';
import { updateShortcutSettings } from '@shoutem/redux-api-sdk';
import { connect } from 'react-redux';
import './style.scss';

class Sms extends Component {
  static propTypes = {
    shortcut: PropTypes.object,
    updateShortcutSettings: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.handleSwitchChange = this.handleSwitchChange.bind(this);
    this.handleLabelTextChange = this.handleLabelTextChange.bind(this);
    this.handleBodyTextChange = this.handleBodyTextChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      error: null,
      smsButtonLabel: _.get(props.shortcut, 'settings.smsButtonLabel'),
      smsBody: _.get(props.shortcut, 'settings.smsBody'),
      showSmsButton: _.get(props.shortcut, 'settings.showSmsButton'),
      // flag indicating if value in input field is changed
      hasChanges: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { shortcut: nextShortcut } = nextProps;
    const { smsButtonLabel, smsBody,  } = this.state;

    if (_.isEmpty(smsButtonLabel) || _.isEmpty(smsBody)) {
      this.setState({
        smsButtonLabel: _.get(nextShortcut, 'settings.smsButtonLabel'),
        smsBody: _.get(nextShortcut, 'settings.smsBody'),
      });
    }
  }

  handleSwitchChange() {
    const { showSmsButton } = this.state;

    this.setState({
      error: '',
      showSmsButton: !showSmsButton,
      hasChanges: true,
    });
  }

  handleLabelTextChange(event) {
    this.setState({
      smsButtonLabel: event.target.value,
      hasChanges: true,
    });
  }

  handleBodyTextChange(event) {
    this.setState({
      smsBody: event.target.value,
      hasChanges: true,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.handleSave();
  }

  handleSave() {
    const { shortcut } = this.props;
    const { smsButtonLabel, smsBody, showSmsButton } = this.state;

    this.setState({ error: '', inProgress: true });
    this.props.updateShortcutSettings(shortcut, { smsButtonLabel, smsBody, showSmsButton })
      .then(() => (
        this.setState({ hasChanges: false, inProgress: false })
      )).catch((err) => {
      this.setState({ error: err, inProgress: false });
    });
  }

  render() {
    const { error, hasChanges, inProgress, showSmsButton, smsButtonLabel, smsBody } = this.state;

    return (
      <div className="hello-page">
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <h3>SMS settings</h3>
            <ControlLabel>Show SMS button:     </ControlLabel>
            <Switch
              value={showSmsButton}
              onChange={this.handleSwitchChange}
            />
            <br />
            <ControlLabel>NOTE: Enabling the SMS button will remove the "View all vacancies" button.</ControlLabel>
            <br />
            <ControlLabel>Button label:</ControlLabel>
            <FormControl
              type="text"
              className="form-control"
              value={smsButtonLabel}
              onChange={this.handleLabelTextChange}
            />
            <ControlLabel>SMS body:</ControlLabel>
            <FormControl
              type="text"
              className="form-control"
              value={smsBody}
              onChange={this.handleBodyTextChange}
            />
          </FormGroup>
          {error &&
          <HelpBlock className="text-error">{error}</HelpBlock>
          }
        </form>
        <ButtonToolbar>
          <Button
            bsStyle="primary"
            disabled={!hasChanges}
            onClick={this.handleSave}
          >
            <LoaderContainer isLoading={inProgress}>
              Save
            </LoaderContainer>
          </Button>
        </ButtonToolbar>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateShortcutSettings: (shortcut, settings) => (
      dispatch(updateShortcutSettings(shortcut, settings))
    ),
  };
}

export default connect(null, mapDispatchToProps)(Sms);
