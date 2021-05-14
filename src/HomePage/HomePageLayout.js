import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";

import { Layout, Menu, Button, Badge, List, Avatar, InputNumber, Modal } from 'antd';
import {
  MenuOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  DollarCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

import ItemPage from '../ItemPage/ItemPage.js';
import ItemPage2 from '../ItemPage/ItemPage2.js';
import LandingPage from '../LandingPage/LandingPage.js'
import OrderPage from '../OrderPage/OrderPage.js';

import Web3 from 'web3'
import Shop from '../abis/Shop.json'
import JUSDToken from '../abis/JUSDToken.json'

import './HomePageLayout.css';
import 'antd/dist/antd.css';
import logo from './images/logo.png';


const { SubMenu } = Menu;
const { Header, Content } = Layout;

function loadItemCount(a) {
  return +localStorage.getItem("itemCount" + a) || 0;
}

function loadItemInCart(a) {
  return JSON.parse(localStorage.getItem("itemInCart" + a) || "[]");
}
function loadTotal(a) {
  return +localStorage.getItem("total" + a) || 0;
}
function storeItemCount(a, itemCount) {
  localStorage.setItem("itemCount" + a, itemCount);
}

function storeItemInCart(a, itemInCart) {
  localStorage.setItem("itemInCart" + a, JSON.stringify(itemInCart));
}

function storeTotal(a, total) {
  localStorage.setItem("total" + a, total);
}

class HomePageLayout extends React.Component {
  constructor(props) {
    super(props);
    this.data = require('../data.json')
    console.log(this.data)
    this.state = {
      JUSDAmount:0,
      account: null,
      shopContract: null,
      confirmLoading: false,
      hidden: false,
      itemCount: 0,
      itemInCart: {},
      orders: [],
      total: 0,
      visible: false
    }
  }


  componentDidMount() {
    this.loadWeb3().then(async () => {
      await this.loadBlockchainData();
      console.log(this.state.orders)
    });
    const itemCount = loadItemCount(this.state.account);
    const itemInCart = loadItemInCart(this.state.account);
    const total = loadTotal(this.state.account);
    this.setState({ itemCount: itemCount, itemInCart: itemInCart, total: total })

    window.ethereum.on('accountsChanged', function (accounts) {
      console.log("changed")
      this.loadWeb3().then(() => {
        this.loadBlockchainData().then(() => {
          const itemCount = loadItemCount(this.state.account);
          const itemInCart = loadItemInCart(this.state.account);
          const total = loadTotal(this.state.account);
          this.setState({ itemCount: itemCount, itemInCart: itemInCart, total: total })
        })

      });
    }.bind(this));
  }

  // Load web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  // load blockchain data
  loadBlockchainData = async () => {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()

    this.setState({ account: accounts[0] })

    // Network ID
    const networkId = await web3.eth.net.getId()
    // Network Data
    const networkData = Shop.networks[networkId]
    // Proceed if network exists
    if (networkData) {
      // Get contract, set state
      const shopContract = new web3.eth.Contract(Shop.abi, networkData.address)
      this.setState({ shopContract: shopContract }, () => {
        this.updateOrderState();
      })
    }
  }

  updateOrderState = async () => {
    console.log("hello")
    this.getOrders().then(orders => {
      const newOrders = [];
      if (orders != null) {
        orders.forEach(order => {
          var newItems = []
          order.items.forEach(item => {
            var f;
            var found = this.data.some(function (e, index) { f = index; return e.id.toString() === item.id; });
            if (found) {
              var newItem = this.data[f]
              newItem["amount"] = item.amount
              console.log(newItem)
              newItems.push(newItem)
            }
          })
          order.items = newItems;
          newOrders.push(order)
        })
        this.setState({ orders: newOrders })

      }
    });
  }

  getOrders = async () => {
    if (this.state.shopContract) {
      // const order_count = this.props.contract.methods.order_count.call().call()
      // console.log(order_count)
      var orders = [];
      await this.state.shopContract.methods.ownerBalance().call().then(async balance => {
        this.setState({JUSDAmount:balance/100})
      })
      await this.state.shopContract.methods.order_count.call().call().then(async order_count => {
        for (var i = 0; i < order_count; i++) {
          // eslint-disable-next-line
          await this.state.shopContract.methods.getOrder(i).call().then(async order_res => {
            if (order_res.account === this.state.account) {
              var order = { "id": order_res.order_id, "total": order_res.total }
              var items = [];
              for (var j = 0; j < order_res.item_count; j++) {
                await this.state.shopContract.methods.getItem(i, j).call().then(item_res => {
                  var item = { "id": item_res }
                  var f;
                  var found = items.some(function (e, index) { f = index; return e.id === item.id; });

                  if (!found) {
                    item["amount"] = 1
                    items.push(item)
                  } else {
                    items[f].amount += 1
                  }
                  order["items"] = items;

                })
              }
              orders.push(order)

              console.log(orders)
            }
          })
        }
      })
      return orders;
    }
  }

  updateTotal = (itemInCart) => {
    console.log(itemInCart);
    var total = 0
    itemInCart.forEach(item => {
      total += item.price * item.amount
    })
    total = Math.round(total)
    storeTotal(this.state.account, total)
    this.setState({ total: total })
  }

  handleAddItem = (newItemCount, newItemInCart) => {
    this.setState({ itemCount: newItemCount, itemInCart: newItemInCart });
    this.updateTotal(newItemInCart)
  }

  remove = (item) => {
    const itemCount = loadItemCount(this.state.account);
    var itemInCart = loadItemInCart(this.state.account);
    console.log(itemCount)

    const itemIndex = itemInCart.findIndex(function (e) {
      return e.id === item.id
    })

    if (itemIndex >= 0) {
      var newItemCount = itemCount - item.amount
      itemInCart.splice(itemIndex, 1)
      storeItemCount(this.state.account, newItemCount);
      storeItemInCart(this.state.account, itemInCart);
      this.setState({ itemCount: newItemCount, itemInCart: itemInCart });
      this.updateTotal(itemInCart)
    }


  }

  onChange(value, item) {
    if (value === 0) {
      this.remove(item)
    } else {
      const itemCount = loadItemCount(this.state.account);
      var itemInCart = loadItemInCart(this.state.account);
      const itemIndex = itemInCart.findIndex(function (e) {
        return e.id === item.id
      })
      if (itemIndex >= 0) {
        var newItemCount = itemCount + value - item.amount
        itemInCart[itemIndex]["amount"] = value
        this.updateTotal(itemInCart)
        storeItemCount(this.state.account, newItemCount);
        storeItemInCart(this.state.account, itemInCart);
        this.setState({ itemCount: newItemCount, itemInCart: itemInCart });
      }
    }
  }

  showModal() {
    this.setState({ visible: true, hidden: true })
  }

  handleCancel = () => {
    console.log('Clicked cancel button');
    this.setState({ visible: false, hidden: false })
  };

  handleOk = () => {
    this.setState({ confirmLoading: true });
    setTimeout(() => {
      this.setState({ visible: false, confirmLoading: false, hidden: false })
      this.checkout();
    }, 1);
  };

  success() {
    Modal.success({
      content: 'Your purchase is complete, thank you for your order!',
    });
  }

  checkout() {
    var items = []
    this.state.itemInCart.forEach(function (item) {
      console.log(item);
      for (var i = 0; i < item.amount; i++) {
        items.push(item.id)
      }
    })

    if (this.state.shopContract) {
      this.setState({ confirmLoading: true });
      this.state.shopContract.methods.createOrder(items, this.state.total).send({ from: this.state.account }).then(() => {
        console.log("purchase success")
        this.setState({ confirmLoading: false });
        this.updateOrderState();
        this.emptyCart()
        this.success()
      });
    }
    this.setState({ confirmLoading: false });
  }

  emptyCart() {
    storeItemCount(this.state.account, 0);
    storeItemInCart(this.state.account, []);
    this.setState({ itemCount: 0, itemInCart: [] });
    this.updateTotal([])
  }



  render() {
    return (
      <Layout style={{ position: 'absolute', height: '100%', width: "100%" }}>
        <Router>
          
            <Menu theme="light" mode="horizontal" sticky="top">
              <SubMenu title="Jack Book Store" onTitleClick={() => window.location = '/'}>
              </SubMenu>
              <SubMenu icon={<MenuOutlined />} title="Categories">
              {/* Manga */}
                <SubMenu title="Manga">
                  <Menu.Item key="fts">
                    <Link to="/Manga/Fantasy">Fantasy</Link>
                  </Menu.Item>
                  <Menu.Item key="scl">
                    <Link to="/Manga/SchoolLife">
                      School Life
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="ac">
                    <Link to="/Manga/Action">Action</Link>
                  </Menu.Item>
                  <Menu.Item key="avt">
                    <Link to="/Manga/Adventure">Adventure</Link>
                  </Menu.Item>
                </SubMenu>

              {/* Fiction */}
                <SubMenu title="Fiction">
                  <Menu.Item key="hr">
                    <Link to="/Fiction/Horror">Horror</Link>
                  </Menu.Item>
                  <Menu.Item key="gen">
                    <Link to="/Fiction/General">
                      General
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="rm">
                    <Link to="/Fiction/Romance">Romance</Link>
                  </Menu.Item>
                  <Menu.Item key="crm">
                    <Link to="/Fiction/Crime-Mystery">Crime & Mystery</Link>
                  </Menu.Item>
                </SubMenu>

              {/* Life Style */}
                <SubMenu title="Life Style">
                  <Menu.Item key="gsp">
                    <Link to="/LifeStyle/Game-Sport">Game & Sport</Link>
                  </Menu.Item>
                  <Menu.Item key="cook">
                    <Link to="/LifeStyle/CookFoodDrink">
                      Cook/Food/Drink
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="ch">
                    <Link to="/LifeStyle/CraftHome">Craft & Home</Link>
                  </Menu.Item>
                   <Menu.Item key="etm">
                    <Link to="/LifeStyle/Entertainment">Entertainment</Link>
                  </Menu.Item>
                </SubMenu>

              {/* Travel & maps */}
                <SubMenu title="Travel">
                  <Menu.Item key="sea">
                    <Link to="/Travel/Southeast-Asia">Southeast Asia Guides</Link>
                  </Menu.Item>
                  <Menu.Item key="amer">
                    <Link to="/Travel/America">America Guides</Link>
                  </Menu.Item>
                   <Menu.Item key="erp">
                    <Link to="/Travel/Europe">Europe Guides</Link>
                  </Menu.Item>
                </SubMenu>

              </SubMenu>
              <SubMenu icon={<UserOutlined />} style={{ float: 'right', color: "black" }}>
                <Menu.Item ><Link to="/orders">Your Orders</Link></Menu.Item>
              </SubMenu>
              <SubMenu
                icon={<Badge count={this.state.itemCount}><Button><ShoppingCartOutlined />Shopping Cart</Button></Badge>}
                key="2"
                theme="light"
                style={{ float: 'right', color: "white" }}
              >
                <div hidden={this.state.hidden}>
                  <List
                    style={{ color: 'black', width: 420 }}
                    itemLayout="horizontal"
                    dataSource={this.state.itemInCart}
                    renderItem={item => (
                      <List.Item
                        actions={[<CloseCircleOutlined style={{ color: 'grey' }} onClick={() => this.remove(item)} />]}
                      >
                        <List.Item.Meta
                          style={{ "margin-left": 20, }}
                          avatar={<Avatar src={item.picture} />}
                          title={<div style={{ color: 'black' }}>{item.name}</div>}
                          description={<InputNumber value={item.amount} onChange={(value) => this.onChange(value, item)} />}
                        />
                        <div style={{ color: 'black', width: 100, "margin-right": 20, }}>
                          Price: ${Math.round(item.price * item.amount, 5)}
                        </div>
                      </List.Item>
                    )}
                  >

                    <List.Item style={{ color: 'black' }}>
                      <div style={{ width: 420, height: 50, "textAlign": "right", "margin-right": 20 }}>
                      total: ${Math.round(this.state.total)}
                      </div>
                    </List.Item>
                  </List>
                  <div style={{ "margin-right": 20, "marginTop": 1, "marginBottom": 10, float: "right" }}>
                    {
                      this.state.itemCount > 0 ?
                        <>
                          <Button onClick={() => this.showModal()}>Checkout</Button>
                          <Modal
                            title="Confirm Checkout"
                            visible={this.state.visible}
                            onOk={this.handleOk}
                            confirmLoading={this.state.confirmLoading}
                            onCancel={this.handleCancel}
                          >
                            <List
                              style={{ width: 420 }}
                              itemLayout="horizontal"
                              dataSource={this.state.itemInCart}
                              renderItem={item => (
                                <List.Item>
                                  <List.Item.Meta
                                    style={{ "margin-left": 20, }}
                                    avatar={<Avatar src={item.picture} />}
                                    title={<div>{item.name}</div>}
                                    description={<div>amount: {item.amount}</div>}
                                  />
                                  <div style={{ width: 100, "margin-right": 20, }}>
                                    Price: ${Math.round(item.price * item.amount, 5)}
                                  </div>
                                </List.Item>
                              )}
                            >
                              <List.Item>
                                <div style={{ width: 420, height: 50, "textAlign": "right", "margin-right": 20 }}>
                                  <DollarCircleOutlined />
                      total: ${Math.round(this.state.total)}
                                </div>
                              </List.Item>
                            </List>
                          </Modal>
                        </> : <Button disabled>Checkout</Button>
                    }
                  </div>
                </div>
              </SubMenu>
            </Menu>

          <Content className="site-layout" style={{ padding: '0 70px', marginTop: 30 }}>

            <div>
              <Route exact path="/"><LandingPage account={this.state.account}></LandingPage></Route>
               {/* <h1>You Have {this.state.JUSDAmount}  $JUSD</h1> */} 

              <Route exact path="/Manga">
                <ItemPage2 class="Manga" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Manga/Fantasy">
                <ItemPage class="Manga" subclass="Fantasy" sublink="/Manga" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Manga/SchoolLife">
                <ItemPage class="Manga" subclass="School Life" sublink="/Manga" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Manga/Action">
                <ItemPage class="Manga" subclass="Action" sublink="/Manga" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Manga/Adventure">
                <ItemPage class="Manga" subclass="Adventure" sublink="/Adventure" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>



              <Route exact path="/LifeStyle">
                <ItemPage2 class="Lifestyle" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/LifeStyle/Game-Sport">
                <ItemPage class="Lifestyle" subclass="Game & Sport" sublink="/Game-Sport" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/LifeStyle/CookFoodDrink">
                <ItemPage class="Lifestyle" subclass="Cookery-food-drink" sublink="/Cookery-food-drink" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/LifeStyle/CraftHome">
                <ItemPage class="Lifestyle" subclass="Craft & Home" sublink="/CraftHome" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/LifeStyle/Entertainment">
                <ItemPage class="Lifestyle" subclass="Entertainment" sublink="/Entertainment" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>


              <Route exact path="/Fiction">
                <ItemPage2 class="Fiction" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Fiction/Horror">
                <ItemPage class="Fiction" subclass="Horror" sublink="/Horror" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Fiction/General">
                <ItemPage class="Fiction" subclass="General" sublink="/General" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Fiction/Romance">
                <ItemPage class="Fiction" subclass="Romance" sublink="/Romance" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Fiction/Crime-Mystery">
                <ItemPage class="Fiction" subclass="Crime & Mystery" sublink="/Crime-Mystery" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>

              <Route exact path="/Travel">
                <ItemPage2 class="Travel & Maps" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Travel/Southeast-Asia">
                <ItemPage class="Travel & Maps" subclass="Southeast Asia Guides" sublink="/Southeast-Asia" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Travel/America">
                <ItemPage class="Travel & Maps" subclass="America Guides" sublink="/America" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>
              <Route exact path="/Travel/Europe">
                <ItemPage class="Travel & Maps" subclass="Europe Guides" sublink="/Europe" account={this.state.account} onAddItem={this.handleAddItem} />
              </Route>

              <Route exact path="/orders"><OrderPage orders={this.state.orders} /></Route>
            </div>

          </Content>
        </Router>
      </Layout >
    )
  }
}

export default HomePageLayout;