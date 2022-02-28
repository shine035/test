import React from 'react'
import { Button } from 'antd'
import PropTypes, { object } from 'prop-types'

// Component
import Icon from 'src/components/Icon/Icon'

// Style
import { ModalWrapper } from 'src/components/Modals/styled/ModalWrapper'

const ModalReceptionMoreTicket = props => {
  const { onCancel, className, onOk, visible, type, color, footer, width, listTicket } = props

  return (
    <ModalWrapper
      title="Tiếp nhận"
      visible={visible}
      onOk={onOk}
      closable={false}
      onCancel={onCancel}
      type={color ? type : false}
      width={width}
      className={className}
      destroyOnClose
      footer={
        footer || footer === null
          ? footer
          : [
              <div key="footer" className="d-flex justify-content-end">
                <Button type={type} key="submit" onClick={() => onOk()}>
                  Đồng ý
                </Button>
                <Button type="secondary" key="back" onClick={onCancel}>
                  Đóng
                </Button>
              </div>
            ]
      }
    >
      <div>
        <div className="ant-modal-body-center">
          <p style={{ paddingBottom: '16px' }}>
            <Icon name="warning" size={80} color="#FFA800" />
          </p>
        </div>
      </div>
      <p>
        Bạn đồng ý tiếp nhận phiếu của độc giả{' '}
        <b>
          {listTicket &&
            listTicket
              .map(elem => {
                return elem.FullName
              })
              .join(', ')}
        </b>
      </p>
    </ModalWrapper>
  )
}

ModalReceptionMoreTicket.defaultProps = {
  width: 620,
  className: 'atbd-modal'
}

ModalReceptionMoreTicket.propTypes = {
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  visible: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  footer: PropTypes.arrayOf(object),
  width: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  listTicket: PropTypes.arrayOf(object)
}

export { ModalReceptionMoreTicket }
