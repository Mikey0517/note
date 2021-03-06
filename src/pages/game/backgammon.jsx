import React, { Component } from 'react';
import { message, Input, Button, List, Row, Col, Tag, Space, Avatar, notification, Switch, Modal } from 'antd';
import { os } from "../../common";
import "../../style/backgammon.css";
import "../../style/chat.css";

const { Search } = Input;
const { confirm } = Modal;

/**
 * 五子棋对战
 * */
class Index extends Component {
  constructor ( props ) {
    super( props );
    this.state = {
      status: 0,
      onLineList: [],
    };
    this.connect = false;
    this.frequency = 0;
    this.webSocket = null;
    this.roomId = null;
    this.ip = null;
    this.firstMove = false;
    this.dealBackgammonMessage = null;
  }

	componentDidMount () {
    this.connectionWebSocket( `ws://23.105.200.139:3000` );
	}

  componentWillUnmount () {
    if ( this.connect ) this.webSocket.send( JSON.stringify( { type: 'close' } ) );
  }

  createWebSocket ( urlValue ) {
    if ( window.WebSocket ) return new WebSocket( urlValue );
    message.error( '对不起，您的浏览器不支持websocket' );
    return false;
  }

  connectionWebSocket ( path ) {
    this.webSocket = this.createWebSocket( path );
    this.webSocket.onopen = () => {
      this.connect = true;
      message.success( '连接成功' );
    }
    this.webSocket.onclose = () => message.success( '连接关闭' );
    this.webSocket.onmessage = this.dealMessage.bind( this );
    this.webSocket.onerror = () => {
      if ( this.frequency > 3 ) {
        message.error( '尝试连接失败，请刷新重试' );
      } else {
        this.frequency += 1;
        message.error( `连接失败，尝试第${ this.frequency }次连接` );
        this.webSocket.send( JSON.stringify( { type: 'close' } ) )
        this.connectionWebSocket( path );
      }
    }
  }

  dealMessage ( msg ) {
    console.log( JSON.parse( msg.data ) );
    const { type, data } = JSON.parse( msg.data );
    if ( type.includes( 'backgammon' ) || type.includes( 'chat' ) ) {
      this.dealBackgammonMessage( type, data )
    } else {
      switch ( type ) {
        case 'onLineIpList':
          this.setState( { onLineList: data } );
          break;
        case 'invite':
          let key = Math.random().toString();
          notification.open( {
            message: '新的消息',
            description: `IP: ${ data.rivalIp } 的用户邀请您对战，是否接受？`,
            btn: (
              <Space>
                <Button type="primary" size="small"
                        onClick={ this.handleReply.bind( this, key, 'accept', data.roomId ) }>
                  接受
                </Button>
                <Button type="primary" danger size="small"
                        onClick={ this.handleCloseNotification.bind( this, key, data.roomId ) }>
                  拒绝
                </Button>
              </Space>
            ),
            duration: 5,
            key,
            onClose: this.handleReply.bind( this, key, 'reject', data.roomId )
          } );
          break;
        case "open-room":
          message.success( '进入房间' );
          this.roomId = data.roomId;
          this.firstMove = data.firstMove;
          this.ip = data.ip;
          this.setState( { status: 1 } )
          break;
        case "reject":
          notification.open( {
            message: '新的消息',
            description: `对方拒绝了您的邀请`,
            duration: 5,
            key: Math.random().toString(),
          } );
          break;
        case "quit-room":
          message.success( `IP:${ data.ip }退出房间，房间解散` );
          this.setState( { status: 0 } );
      }
    }
  }

  handleReply ( key, type, roomId ) {
    notification.close( key );
    this.webSocket.send( JSON.stringify( { type: 'reply', data: { roomId, type } } ) );
  }

  handleCloseNotification ( key, roomId ) {
    this.handleReply( key, 'reject', roomId );
  }

  handleLaunch ( id ) {
    this.webSocket.send( JSON.stringify( { type: 'launch', data: id } ) );
  }

  render () {
    const { onLineList, status } = this.state;
    return (
      <Row style={ { padding: '15px' } }>
        <Col offset={ 1 } span={ 22 }>
          {
            status === 0 && (
              <List
                header={ <div>在线列表</div> }
                pagination={ {
                  position: 'bottom',
                  total: onLineList.length,
                  pageSize: 10
                } }
                bordered
                size="small"
                dataSource={ onLineList }
                renderItem={ item => (
                  <List.Item>
                    { item.ip }
                    { item.isUser && <Tag color="#f50" style={ { float: "right" } }>我</Tag> }
                    { !item.isUser && <Button size="small" style={ { float: "right" } }
                                              onClick={ this.handleLaunch.bind( this, item.id ) }>发起对战</Button> }
                  </List.Item>
                ) }
              />
            )
          }
          {
            status === 1 && (
              <Backgammon
                roomId={ this.roomId }
                firstMove={ this.firstMove }
                webSocket={ this.webSocket }
                ip={ this.ip }
                trigger={ trigger => this.dealBackgammonMessage = trigger.dealMassage }
              />
            )
          }
        </Col>
      </Row>
    );
  }
}

class Backgammon extends Component {
  constructor ( props ) {
    super( props );
    this.state = {
      history: [],
      firstMove: props.firstMove,
      result: {
        status: 0,
        text: '对战中'
      }
    };
    this.webSocket = props.webSocket;
    this.roomId = props.roomId;
    this.ip = props.ip;
    this.config = {
      x: 17,
      y: 17
    };
    this.point = this.showPoint();
    this.isClick = props.firstMove;
    this.dealChatMessage = null;
    this.isPc = os().isPc;
    this.trigger = { dealMassage: this.dealMassage.bind( this ) };
  }

  componentWillMount () {
    const { trigger } = this.props;
    trigger && trigger( this.trigger );
  }

  dealMassage ( type, data ) {
    if ( type.includes( 'chat' ) ) {
      this.dealChatMessage( type, data );
    } else {
      switch ( type ) {
        case "backgammon-point":
          const { i, j } = data.point;
          this.handleClick( 1, i, j );
          break;
        case "backgammon-refresh":
          if ( data.status === 0 ) {
            this.handleRefresh();
          } else {
            message.success( "对方拒绝了重新开始" );
          }
          break;
        case "backgammon-get-refresh":
          let key = Math.random().toString();
          notification.open( {
            message: '新的消息',
            description: `对方请求重新开始 ？`,
            btn: (
              <Space>
                <Button type="primary" size="small"
                        onClick={ this.handleGetRefresh.bind( this, 1, 0, key ) }>
                  接受
                </Button>
                <Button type="primary" danger size="small"
                        onClick={ this.handleGetRefresh.bind( this, 1, 1, key ) }>
                  拒绝
                </Button>
              </Space>
            ),
            duration: 5,
            key,
            onClose: this.handleGetRefresh.bind( this, 1, 1, key )
          } );
          break;
        case "backgammon-first-move":
          message.success( "对方切换你为先手" );
          this.isClick = true;
          this.setState( { firstMove: true } );
      }
    }
  }

  showPoint () {
    const { x, y } = this.config;
    const i = Math.floor( x / 2 );
    const j = Math.floor( y / 2 );
    return [
      this.formatPoint( 0, i - 5, j - 5 ), this.formatPoint( 0, i, j - 5 ), this.formatPoint( 0, i + 5, j - 5 ),
      this.formatPoint( 0, i - 5, j ), this.formatPoint( 0, i, j ), this.formatPoint( 0, i + 5, j ),
      this.formatPoint( 0, i - 5, j + 5 ), this.formatPoint( 0, i, j + 5 ), this.formatPoint( 0, i + 5, j + 5 ),
    ]
  }

  formatPoint ( type, i, j ) {
    if ( type === 0 ) {
      return `${ i }-${ j }`
    } else {
      const arr = i.split( '-' );
      return {
        i: Number( arr[ 0 ] ),
        j: Number( arr[ 1 ] )
      }
    }
  }

  handleClick ( type, i, j ) {
    if ( this.isClick && type === 0 || !this.isClick && type === 1 ) {
      let history = [].concat( this.state.history );
      this.isClick = true;
      if ( type === 0 ) {
        this.isClick = false;
        this.handleSend( {
          type: 'backgammon-point',
          data: {
            roomId: this.roomId,
            point: {
              i,
              j
            }
          }
        } )
      }
      history.push( this.formatPoint( 0, i, j ) );
      this.setState( { history }, () => {
        const { res, chessman } = this.verification( i, j );
        if ( res ) {
          this.isClick = false;
          const result = {
            status: 1,
            text: `${ chessman === 0 ? '白' : '黑' }棋胜利`
          };
          message.success( result.text );
          this.setState( { result } );
        }
      } );
    }
  }

  verification ( i, j ) {
    const { history } = this.state;
    if ( history.length < 9 ) return false;
    const datumIndex = history.indexOf( this.formatPoint( 0, i, j ) );
    const chessman = datumIndex % 2 === 0 ? 0 : 1;
    let res = false;
    let length = 0;

    const traverse = ( k, direction, _i, _j ) => {
      const point = getPoint( k, direction, _i, _j );
      const index = history.indexOf( this.formatPoint( 0, point.i, point.j ) );
      const type = index % 2 === 0 ? 0 : 1;
      if ( chessman === type && index !== -1 ) {
        if ( length === 3 ) {
          return true;
        } else {
          length++;
          return traverse( k, direction, point.i, point.j )
        }
      } else {
        if ( direction === 1 ) {
          return false;
        } else {
          direction++;
          return traverse( k, direction, i, j )
        }
      }
    }

    const getPoint = ( type, direction, i, j ) => {
      switch ( type ) {
        case 0:
          j = j + (direction === 0 ? -1 : 1);
          break;
        case 1:
          i = i + (direction === 0 ? 1 : -1);
          j = j + (direction === 0 ? -1 : 1);
          break;
        case 2:
          i = i + (direction === 0 ? 1 : -1);
          break;
        case 3:
          i = i + (direction === 0 ? 1 : -1);
          j = j + (direction === 0 ? 1 : -1);
          break;
      }
      return {
        i,
        j
      }
    }

    for ( let k = 0; k < 4; k++ ) {
      length = 0;
      if ( traverse( k, 0, i, j ) ) {
        res = true;
        break;
      }
    }
    return {
      res,
      chessman
    };
  }

  handleSend ( data ) {
    this.webSocket.send( JSON.stringify( data ) );
  }

  renderFormItem ( label, content ) {
    return (
      <Space>
        {
          label !== "" && (
            <div className="backgammon-label">
              { label }
              <span>：</span>
            </div>
          )
        }
        <div className="backgammon-content">{ content }</div>
      </Space>
    )
  }

  handleRefresh () {
    const { firstMove } = this.props;
    this.setState( {
      history: [],
      firstMove: firstMove,
      result: {
        status: 0,
        text: '对战中'
      }
    } )
  }

  handleGetRefresh ( type, status, key ) {
    if ( type === 0 ) {
      confirm( {
        title: '提示',
        content: '确认向对方请求重新开始 ?',
        onOk: () => {
          this.handleSend( { type: 'backgammon-get-refresh', data: { roomId: this.roomId } } )
        },
      } );
    } else {
      this.handleSend( { type: 'backgammon-get-refresh', data: { roomId: this.roomId, status } } );
      notification.close( key );
      if ( status === 0 ) this.handleRefresh();
    }
  }

  handleToggle ( checked ) {
    if ( checked ) {
      this.isClick = !checked;
      this.handleSend( { type: "backgammon-first-move", data: { roomId: this.roomId } } );
    }
    this.setState( { firstMove: !checked } );
  }

  handleQuitRoom () {
    this.handleSend( { type: "quit-room", data: { roomId: this.roomId, ip: this.ip } } );
  }

  render () {
    const { history, firstMove, result } = this.state;
    const { x, y } = this.config;
    const chessPlayerText = `${ history.length % 2 === 0 ? '白' : '黑' }棋（ ${ this.isClick ? '我' : '对手' } ）`
    return (
      <div className={ `backgammon ${ !this.isPc && 'no-pc' }` }>
        <div>
          <div className={ `backgammon-container ${ !this.isClick && 'no-select' }` }>
            {
              (new Array( y )).fill( 0 ).map( ( item, j ) => (
                <div className="backgammon-row" key={ j }>
                  {
                    (new Array( x )).fill( 0 ).map( ( item, i ) => {
                      let className = "";
                      const format = this.formatPoint( 0, i, j )
                      const index = history.indexOf( format );
                      if ( index > -1 ) {
                        className = index % 2 === 0 ? "backgammon-white" : "backgammon-black";
                      } else if ( this.point.includes( format ) ) {
                        className = "backgammon-anchor";
                      }
                      return (
                        <div className="backgammon-col" key={ `${ i }-${ j }` }
                             onClick={ this.handleClick.bind( this, 0, i, j ) }>
                          <div className={ className }/>
                        </div>
                      )
                    } )
                  }
                </div>
              ) )
            }
          </div>
          <div className="backgammon-operating">
            <div className="title">信息</div>
            { this.renderFormItem( '当前执棋者', chessPlayerText ) }
            { this.renderFormItem( '对局结果', result.text ) }
            <div className="title">操作</div>
            { this.renderFormItem( '切换对方先手', <Switch checked={ !firstMove }
                                                     disabled={ !firstMove || history.length !== 0 }
                                                     onChange={ this.handleToggle.bind( this ) }/> ) }
            { this.renderFormItem( '', (
              <div>
                <Button size="small" onClick={ this.handleGetRefresh.bind( this, 0 ) }>重新开始</Button>
                <Button size="small" onClick={ this.handleQuitRoom.bind( this, 0 ) }>退出房间</Button>
              </div>
            ) ) }
            <Chat
              roomId={ this.roomId }
              webSocket={ this.webSocket }
              trigger={ trigger => this.dealChatMessage = trigger.dealMassage }
            />
          </div>
        </div>
      </div>
    )
  }
}

class Chat extends Component {
  constructor ( props ) {
    super( props );
    this.state = {
      chatList: [],
      value: ""
    };
    this.webSocket = props.webSocket;
    this.roomId = props.roomId;
    this.isPc = os().isPc;
    this.trigger = { dealMassage: this.dealMassage.bind( this ) };
  }

  componentWillMount () {
    const { trigger } = this.props;
    trigger && trigger( this.trigger );
  }

  componentDidUpdate ( prevProps, prevState, snapshot ) {
    if ( this.state.chatList.length !== prevState.chatList.length ) {
      document.getElementsByClassName( 'chat-warp' )[ 0 ].lastChild.scrollIntoView( false );
    }
  }

  dealMassage ( type, data ) {
    switch ( type ) {
      case "chat-msg":
        this.handleChat( 1, data.content );
    }
  }

  handleChat ( type, value ) {
    let state = {};
    let chatList = [].concat( this.state.chatList );
    if ( type === 0 ) {
      chatList.push( {
        direction: 'right',
        avatarText: '我',
        content: value,
        contentBg: "#9EEA6A"
      } );
      state.value = "";

      this.handleSend( {
        type: 'chat-msg',
        data: {
          roomId: this.roomId,
          content: value
        }
      } )
    } else {
      chatList.push( {
        direction: 'left',
        avatarText: '对手',
        content: value,
        contentBg: "#FFFFFF"
      } );
    }
    state.chatList = chatList;
    console.log( state )
    this.setState( state );
  }

  handleChange ( e ) {
    this.setState( { value: e.target.value } );
  }

  handleSend ( data ) {
    this.webSocket.send( JSON.stringify( data ) );
  }

  render () {
    const { chatList, value } = this.state;
    return (
      <div className={ `chat ${ !this.isPc && 'no-pc' }` }>
        <div className="chat-container">
          <div className="chat-warp">
            {
              chatList.map( ( item, index ) => (
                <ChatItem
                  key={ index }
                  direction={ item.direction }
                  avatarText={ item.avatarText }
                  content={ item.content }
                  contentBg={ item.contentBg }
                />
              ) )
            }
          </div>
        </div>
        <Search
          value={ value }
          placeholder="回车发送"
          enterButton="发送"
          onSearch={ this.handleChat.bind( this, 0 ) }
          onChange={ this.handleChange.bind( this ) }
        />
      </div>
    )
  }
}

class ChatItem extends Component {
  render () {
    const { direction = 'right', avatarText = "", content = "", contentBg = "#FFFFFF" } = this.props;
    return (
      <div
        className={ `chat-item ${ direction !== 'left' && 'right' }` }
      >
        <div style={ { [ `margin${ direction === 'left' ? 'Right' : 'Left' }` ]: '8px' } }>
          <Avatar style={ { color: '#f56a00', backgroundColor: '#fde3cf' } }>{ avatarText }</Avatar>
        </div>
        <div className="content" style={ { background: contentBg } }>
          { content }
        </div>
      </div>
    )
  }
}

export default Index;