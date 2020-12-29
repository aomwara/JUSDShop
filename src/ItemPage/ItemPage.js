import { Card, List } from 'antd';
import { Breadcrumb } from 'antd';
import React from 'react';
import './ItemPage.css';
import { PlusCircleOutlined } from '@ant-design/icons';
import { BrowserRouter as Link } from "react-router-dom";

const { Meta } = Card;

class ItemPage extends React.Component {
    constructor(props){
        super(props);
        this.data = require('../data.json')
        this.class = this.props.class;
        this.sublink = this.props.sublink;
        this.subclass = this.props.subclass;
        console.log(this.class)
        this.newData = []
        this.data.forEach(item=>{
            if (item.class === this.class && this.subclass === item.subclass){
                this.newData.push(item)
            }
        })
    }
    

    add(item) {
        const itemCount = +localStorage.getItem("itemCount" + this.props.account) || 0;
        var newItemCount = itemCount + 1
        // var itemInCart = [];
        var itemInCart = JSON.parse(localStorage.getItem("itemInCart" + this.props.account) || "[]");

        console.log(itemInCart)
        var f;
        var found = itemInCart.some(function(e, index) { f = index; return e.id === item.id; });

        if (!found) {
            item["amount"] = 1
            itemInCart.push(item)
        } else {
            itemInCart[f].amount += 1
        }
        localStorage.setItem("itemCount" + this.props.account, newItemCount);
        localStorage.setItem("itemInCart" + this.props.account, JSON.stringify(itemInCart))

        this.props.onAddItem(newItemCount, itemInCart);


        // localStorage.setItem("itemCount", 0);
        // localStorage.setItem("itemInCart", JSON.stringify([]))
    }

    render() {
        return (
            <div>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item><Link to={`${this.sublink}`}>{this.class}</Link></Breadcrumb.Item>
                    <Breadcrumb.Item>{this.subclass}</Breadcrumb.Item>
                </Breadcrumb>
                <List
                    grid={{
                        gutter: 16,
                        column: 8
                    }}
                    dataSource={this.newData}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                size="small"
                                cover={<img alt={item.name} src={item.picture} />}
                                actions={[
                                    // <StarOutlined />,
                                    <div />,
                                    <PlusCircleOutlined onClick={() => this.add(item)} />
                                ]}>
                                <Meta

                                    title={item.name}
                                    description={<div>{"$" + item.price}</div>}
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
        )
    }
}

export default ItemPage;