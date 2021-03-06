import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Input, Col, Space, Radio } from 'antd'

// Function Helpers
import { formatDateVN } from 'src/helpers/FomatDateTime'

// API Service
import FileService from 'src/api/FileService'

// Component
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'

// Styled Component
import { ModalWrapper, RowWrapper } from '../styled/ModalWrapper'

const ModalDetailFile = props => {
  const { languages, nationalAssembly, congressMeeting, meeting } = useSelector(state => state.common)
  const { onCancel, className, onReceive, onReject, visible, type, style, color, width, fileObjectGuid } = props

  // State
  const [detailFile, setDetailFile] = useState({})

  // State Modal
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)

  const getFileByObjectGuid = ObjectGuid => {
    FileService.getOne(ObjectGuid).then(res => {
      if (!res.isError && !res.Status) {
        setDetailFile({
          ...res?.Object,
          Languages: getListLanguage(res.Object?.Languages),
          EndDate: formatDateVN(res.Object?.EndDate),
          DeliveryDate: formatDateVN(res.Object?.DeliveryDate),
          NationalAssemblyFrom: getNationalAssemblyByID(res.Object?.NationalAssemblyFrom),
          NationalAssemblyTo: getNationalAssemblyByID(res.Object?.NationalAssemblyTo),
          CongressMeetingFrom: getCongressMeetingByID(res.Object?.CongressMeetingFrom),
          CongressMeetingTo: getCongressMeetingByID(res.Object?.CongressMeetingTo),
          MeetingFrom: getMeetingByID(res.Object?.MeetingFrom),
          MeetingTo: getMeetingByID(res.Object?.MeetingTo)
        })
      }
    })
  }

  const getListLanguage = listLanguage => {
    const list = []
    listLanguage?.forEach(item => {
      list.push(languages.filter(e => e.CodeKey === item))
    })
    return list
  }

  const getNationalAssemblyByID = id => {
    return nationalAssembly.find(item => Number(item.CodeValue) === id)
  }

  const getCongressMeetingByID = id => {
    return congressMeeting.find(item => Number(item.CodeValue) === id)
  }

  const getMeetingByID = id => {
    return meeting.find(item => Number(item.CodeValue) === id)
  }

  const onReceiveFile = () => {
    onReceive()
    setIsOpenModalConfirmReception(false)
  }

  const onRejectFile = content => {
    onReject(content)
    setIsOpenModalDenyReception(false)
  }

  useEffect(() => {
    if (!visible) return
    getFileByObjectGuid(fileObjectGuid)
  }, [fileObjectGuid])

  return (
    <ModalWrapper
      title="Chi ti???t h??? s??"
      visible={visible}
      style={style}
      onCancel={onCancel}
      type={color ? type : false}
      width={width}
      className={className}
      destroyOnClose
      footer={[
        <div className="d-flex justify-content-between" key={1}>
          {/* <Space> */}
          <Button type="danger" key="deny" onClick={() => setIsOpenModalDenyReception(true)}>
            T??? ch???i
          </Button>
          <Space size="small">
            <Button type="primary" key="reception" onClick={() => setIsOpenModalConfirmReception(true)}>
              Ti???p nh???n
            </Button>
            <Button type="secondary" key="back" onClick={onCancel}>
              ????ng
            </Button>
          </Space>
          {/* </Space> */}
        </div>
      ]}
    >
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ti??u ?????:</b>
        </Col>
        <Col span={18}>
          <span>{detailFile?.Title}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>M?? h??? s??:</b>
        </Col>
        <Col span={18}>
          <span>{detailFile?.FileCode}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Nh??m h??? s??:</b>
        </Col>
        <Col span={18}>
          <span>
            {detailFile?.GroupFile === 1
              ? 'H??? s?? gi???y'
              : detailFile?.GroupFile === 2
              ? 'H??? s?? nh??n'
              : detailFile?.GroupFile === 3
              ? 'H??? s?? nghe nh??n'
              : ''}
          </span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>H??? s?? s???:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.FileNo}</span>
        </Col>
        <Col span={6}>
          <b>M???c l???c s???:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.FileCatalog}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>M?? CQ l??u tr???:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.Identifier}</span>
        </Col>
        <Col span={6}>
          <b>K?? hi???u th??ng tin:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.InforSign}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>S??? t???:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.PiecesOfPaper}</span>
        </Col>
        <Col span={6}>
          <b>S??? trang:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.PageNumber}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>S??? l?????ng VB:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.TotalDoc}</span>
        </Col>
        <Col span={6}>
          <b>Th???i gian k???t th??c:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.EndDate}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Kh??a:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.NationalAssemblyFrom?.CodeKey}</span>
        </Col>
        <Col span={6}>
          <b>?????n:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.NationalAssemblyTo?.CodeKey}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>K??? h???p th???:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.CongressMeetingFrom?.CodeKey}</span>
        </Col>
        <Col span={6}>
          <b>?????n:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.CongressMeetingTo?.CodeKey}</span>
        </Col>
      </RowWrapper>

      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Phi??n h???p:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.MeetingFrom?.CodeKey}</span>
        </Col>
        <Col span={6}>
          <b>?????n:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.MeetingTo?.CodeKey}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>??/V, c?? nh??n n???p:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.PersonallyFiled}</span>
        </Col>
        <Col span={6}>
          <b>Ng??y giao:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.DeliveryDate}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ng??n ng???:</b>
        </Col>
        <Col span={18}>
          <span>
            {detailFile?.Languages?.map((item, idx) => {
              if (idx + 1 < detailFile?.Languages?.length) {
                return `${item[0]?.Text}, `
              }
              return item[0]?.Text
            })}
          </span>
        </Col>
      </RowWrapper>
      <div className="custom-col">
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>T??? kh??a</b>
          </Col>
        </RowWrapper>
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>V???n ????? ch??nh:</b>
          </Col>
          <Col span={18}>
            <span>{detailFile?.KeywordIssue}</span>
          </Col>
        </RowWrapper>
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>?????a danh:</b>
          </Col>
          <Col span={18}>
            <span>{detailFile?.KeywordPlace}</span>
          </Col>
        </RowWrapper>
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>S??? ki???n:</b>
          </Col>
          <Col span={18}>
            <span>{detailFile?.KeywordEvent}</span>
          </Col>
        </RowWrapper>
      </div>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ch?? gi???i:</b>
        </Col>
        <Col span={18}>
          <span>{detailFile?.Description}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>T??nh tr???ng v???t l??:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.Format === 1 ? 'B??nh th?????ng' : 'H?? h???ng'}</span>
        </Col>
        <Col span={6}>
          <b>Ch??? ????? s??? d???ng:</b>
        </Col>
        <Col span={6}>
          <span>{detailFile?.Rights === 1 ? 'H???n ch???' : 'Kh??ng h???n ch???'}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20} className="align-items-center">
        <Col span={6}>
          <b>Th???i h???n b???o qu???n:</b>
        </Col>
        <Col span={9}>
          <Radio.Group value={detailFile?.StorageTimeType}>
            <Radio value={1}>V??nh vi???n</Radio>
            <Radio value={2}>C?? th???i h???n</Radio>
          </Radio.Group>
        </Col>

        {detailFile?.StorageTimeType === 2 && (
          <>
            <Col span={3}>
              <Input disabled defaultValue={detailFile?.Maintenance} />
            </Col>
            <Col span={2}>N??m</Col>
          </>
        )}
      </RowWrapper>
      {/* Modals */}
      <ModalConfirmReception
        visible={isOpenModalConfirmReception}
        type="primary"
        data={detailFile}
        onOk={onReceiveFile}
        onCancel={() => setIsOpenModalConfirmReception(false)}
      />
      <ModalDenyReception
        visible={isOpenModalDenyReception}
        onOk={content => onRejectFile(content)}
        onCancel={() => setIsOpenModalDenyReception(false)}
      />
    </ModalWrapper>
  )
}

ModalDetailFile.defaultProps = {
  width: 756,
  className: 'custom-modal-detail-user atbd-modal'
}

ModalDetailFile.propTypes = {
  fileObjectGuid: PropTypes.string,
  onCancel: PropTypes.func,
  onReceive: PropTypes.func,
  onReject: PropTypes.func,
  visible: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
}

export default ModalDetailFile
