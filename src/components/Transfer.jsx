import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Donation from '../models/Donation';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux'
import { addDonation } from '../redux/reducers/donationsSlice'
import User from 'models/User';
import TextField from '@material-ui/core/TextField';
import FavoriteIcon from '@material-ui/icons/Favorite';
import InputAdornment from '@material-ui/core/InputAdornment';
import config from '../configuration';
import TokenBalance from './TokenBalance';
import Web3Utils from '../utils/Web3Utils';
import { selectCurrentUser } from '../redux/reducers/currentUserSlice'
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class Transfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationIsValid: false,
      open: false,
      amount: 0,
      checked: [],
      left: [0, 1, 2, 3],
      right: [4, 5, 6, 7]
    };
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleDonate = this.handleDonate.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleAmountBlur = this.handleAmountBlur.bind(this);
    this.checkDonation = this.checkDonation.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this.handleToggle = this.handleToggle.bind(this);
    this.setChecked = this.setChecked.bind(this);
    this.numberOfChecked = this.numberOfChecked.bind(this);
    this.union = this.union.bind(this);
    this.setLeft = this.setLeft.bind(this);
    this.setRight = this.setRight.bind(this);

    //this.leftChecked = this.intersection(checked, left);
    //this.rightChecked = this.intersection(checked, right);
  }

  not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
  }

  intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
  }

  union(a, b) {
    return [...a, ...this.not(b, a)];
  }

  handleToggle(value) {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setChecked(newChecked);
  };

  setChecked(checked) {
    this.setState({
      checked: checked
    });
  }

  setLeft(left) {
    this.setState({
      left: left
    });
  }

  setRight(right) {
    this.setState({
      right: right
    });
  }

  numberOfChecked(items) {
    const { checked } = this.state;
    return this.intersection(checked, items).length;
  }

  handleToggleAll = (items) => () => {
    const { checked } = this.state;
    if (this.numberOfChecked(items) === items.length) {
      this.setChecked(this.not(checked, items));
    } else {
      this.setChecked(this.union(checked, items));
    }
  };

  handleCheckedRight() {
    const { checked, left, right } = this.state;
    let leftChecked = this.intersection(checked, left);
    this.setRight(right.concat(leftChecked));
    this.setLeft(this.not(left, leftChecked));
    this.setChecked(this.not(checked, leftChecked));
  };

  handleCheckedLeft() {
    const { checked, left, right } = this.state;
    let rightChecked = this.intersection(checked, right);
    this.setLeft(left.concat(rightChecked));
    this.setRight(this.not(right, rightChecked));
    this.setChecked(this.not(checked, rightChecked));
  };

  handleClickOpen() {
    this.open();
  };

  handleClose() {
    this.close();
  };

  handleAmountChange(event) {
    this.setState({
      amount: event.target.value === '' ? '' : Number(event.target.value)
    });
    this.checkDonation();
  };

  customList(title, items) {
    const { checked, left, right } = this.state;
    const { classes } = this.props;
    return (
      <Card>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Checkbox
              onClick={this.handleToggleAll(items)}
              checked={this.numberOfChecked(items) === items.length && items.length !== 0}
              indeterminate={this.numberOfChecked(items) !== items.length && this.numberOfChecked(items) !== 0}
              disabled={items.length === 0}
              inputProps={{ 'aria-label': 'all items selected' }}
            />
          }
          title={title}
          subheader={`${this.numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <List className={classes.list} dense component="div" role="list">
          {items.map((value) => {
            const labelId = `transfer-list-all-item-${value}-label`;

            return (
              <ListItem key={value} role="listitem" button onClick={this.handleToggle(value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`List item ${value + 1}`} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
    );
  }

  handleAmountBlur() {
    const { amount } = this.state;
    const { currentUser } = this.props;
    const max = Web3Utils.weiToEther(currentUser.balance);
    if (amount < 0) {
      this.setState({
        amount: 0
      });
    } else if (amount > max) {
      this.setState({
        amount: max
      });
    }
    this.checkDonation();
  };

  checkDonation() {
    const { amount } = this.state;
    let donationIsValid = false;
    if (amount > 0) {
      donationIsValid = true;
    }
    this.setState({
      donationIsValid: donationIsValid
    });
  }

  handleDonate() {
    const { amount } = this.state;
    const { entityId, currentUser, tokenAddress, addDonation } = this.props;
    const donation = new Donation();
    donation.entityId = entityId;
    donation.tokenAddress = tokenAddress;
    donation.amount = Web3Utils.etherToWei(amount);
    donation.giverAddress = currentUser.address;
    addDonation(donation);
    this.close();
  };

  open() {
    this.setState({
      open: true
    });
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    const { donationIsValid, open, checked, left, right } = this.state;
    const { title, description, entityCard, enabled, currentUser, classes, t } = this.props;

    // TODO Definir parametrización de donación.
    const balance = currentUser.balance;
    const max = Web3Utils.weiToEther(balance);
    const inputProps = {
      step: 0.0001,
      min: 0,
      max: max,
      size: 31
    };


    let tokenConfig = config.tokens[this.props.tokenAddress];
    let tokenSymbol = tokenConfig.symbol;

    let leftChecked = this.intersection(checked, left);
    let rightChecked = this.intersection(checked, right);

    return (
      <div>
        {enabled && (
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<FavoriteIcon />}
            onClick={this.handleClickOpen}
          >
            {t('transfer')}
          </Button>)
        }
        <Dialog fullWidth={true}
          maxWidth="md"
          open={open}
          onClose={this.handleClose}
          TransitionComponent={Transition}>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                {title}
              </Typography>
              <Button autoFocus
                color="inherit"
                onClick={this.handleDonate}
                disabled={!donationIsValid}>
                {t('donate')}
              </Button>
            </Toolbar>
          </AppBar>
          <div className={classes.root}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                {entityCard}
              </Grid>
              <Grid item xs={8}>
                <Grid container>
                  <Typography variant="subtitle1" gutterBottom>
                    {description}
                  </Typography>

                  <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
                    <Grid item>{this.customList('Choices', left)}</Grid>
                    <Grid item>
                      <Grid container direction="column" alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.button}
                          onClick={this.handleCheckedRight}
                          disabled={leftChecked.length === 0}
                          aria-label="move selected right"
                        >
                          &gt;
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          className={classes.button}
                          onClick={this.handleCheckedLeft}
                          disabled={rightChecked.length === 0}
                          aria-label="move selected left"
                        >
                          &lt;
                      </Button>
                      </Grid>
                    </Grid>
                    <Grid item>{this.customList('Chosen', right)}</Grid>
                  </Grid>

                </Grid>
              </Grid>
            </Grid>
          </div>
        </Dialog>
      </div >
    );
  }
}

Transfer.propTypes = {
  currentUser: PropTypes.instanceOf(User).isRequired,
  tokenAddress: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
};

Transfer.defaultProps = {
  tokenAddress: config.nativeToken.address,
  enabled: false
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: '1em'
  },
  amount: {
    width: '100%',
    marginTop: '1em'
  },
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  button: {
    margin: theme.spacing(1),
  },
  /*root: {
    margin: 'auto',
  },*/
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 200,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  }/*,
  button: {
    margin: theme.spacing(0.5, 0),
  },*/
});

const mapStateToProps = (state, ownProps) => {
  return {
    currentUser: selectCurrentUser(state)
  }
}

const mapDispatchToProps = { addDonation }

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(
    withTranslation()(Transfer)
  )
);