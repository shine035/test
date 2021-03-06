import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Button, Input, Col, Space, Radio } from 'antd'

// API Service
import DocumentService from 'src/api/DocumentService'

// Function Helpers
import { formatDateVN } from 'src/helpers/FomatDateTime'
// import {
//   getListLanguage,
//   getNationalAssemblyByID,
//   getCongressMeetingByID,
//   getMeetingByID,
//   getSecurityLevelByID,
//   getOrganNameByID,
//   getAgencyCreateByID,
//   getTypeNameByID
// } from 'src/helpers/GetInfoByID'

// Component
import { ModalConfirmReception } from './ModalConfirmReception'
import { ModalDenyReception } from './ModalDenyReception'

// Styled Component
import { ModalWrapper, RowWrapper } from '../styled/ModalWrapper'

const ModalDetailDocument = props => {
  const {
    languages,
    nationalAssembly,
    congressMeeting,
    meeting,
    agencyCreate,
    organName,
    documentTypes,
    securityLevel
  } = useSelector(state => state.common)
  const { onCancel, className, onReceive, onReject, visible, type, color, width, documentObjectGuid } = props

  // State
  const [inforDocument, setInforDocument] = useState({})

  // State Modal
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)

  const getDocumentByObjectGuid = () => {
    DocumentService.getOneDocumentSync(documentObjectGuid).then(res => {
      if (!res.isError && !res.Status) {
        setInforDocument({
          ...res?.Object,
          Languages: getListLanguage(res.Object?.Languages),
          IssuedDate: formatDateVN(res.Object?.IssuedDate),
          NationalAssembly: getNationalAssemblyByID(res.Object?.NationalAssembly),
          CongressMeeting: getCongressMeetingByID(res.Object?.CongressMeeting),
          Meeting: getMeetingByID(res.Object?.Meeting),
          AgencyCreate: getAgencyCreateByID(res.Object?.AgencyCreate),
          OrganName: getOrganNameByID(res?.Object?.OrganName),
          TypeName: getTypeNameByID(res?.Object?.TypeName),
          SecurityLevel: getSecurityLevelByID(res?.Object?.SecurityLevel)
        })
      }
    })
  }

  const getListLanguage = listLanguage => {
    const list = listLanguage?.map(item => languages.filter(e => e.CodeKey === item))
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

  const getAgencyCreateByID = id => {
    return agencyCreate.find(item => Number(item.CodeValue) === id)
  }

  const getOrganNameByID = id => {
    return organName.find(item => Number(item.CodeValue) === id)
  }

  const getTypeNameByID = id => {
    return documentTypes.find(item => Number(item.CodeValue) === id)
  }

  const getSecurityLevelByID = id => {
    return securityLevel.find(item => Number(item.CodeValue) === id)
  }

  const onReceiveDocument = () => {
    onReceive()
    setIsOpenModalConfirmReception(false)
    onCancel()
  }

  const onRejectDocument = content => {
    onReject(content)
    setIsOpenModalDenyReception(false)
    onCancel()
  }

  useEffect(() => {
    if (!visible) return
    getDocumentByObjectGuid(documentObjectGuid)
  }, [visible, documentObjectGuid])

  return (
    <ModalWrapper
      title="Chi ti???t t??i li???u gi???y"
      visible={visible}
      onCancel={onCancel}
      type={color ? type : false}
      width={width}
      className={className}
      destroyOnClose
      footer={[
        <div className="d-flex justify-content-end" key={1}>
          <Space size="small">
            <Button type="danger" key="deny" onClick={() => setIsOpenModalDenyReception(true)}>
              T??? ch???i
            </Button>
            <Button type="primary" key="reception" onClick={() => setIsOpenModalConfirmReception(true)}>
              Ti???p nh???n
            </Button>
            <Button type="secondary" key="back" onClick={onCancel}>
              ????ng
            </Button>
          </Space>
        </div>
      ]}
    >
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ti??u ?????:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.Subject}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>M?? ?????nh danh VB:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.DocCode}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>S??? v?? k?? hi???u:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.FileNotation}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>S??? v??n b???n:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.CodeNumber}</span>
        </Col>
        <Col span={6}>
          <b>Lo???i v??n b???n:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.TypeName?.Text}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>CQ, t??? ch???c BH:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.OrganName?.Text}</span>
        </Col>
        <Col span={6}>
          <b>????n v??? so???n th???o:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.AgencyCreate?.Text}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>L??nh v???c:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.Field}</span>
        </Col>
        <Col span={6}>
          <b>Ng??y v??n b???n:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.IssuedDate}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>K?? hi???u th??ng tin:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.InforSign}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>S??? t???:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.PiecesOfPaper}</span>
        </Col>
        <Col span={6}>
          <b>S??? trang:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.PageAmount}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ng??n ng???:</b>
        </Col>
        <Col span={18}>
          <span>
            {inforDocument?.Languages?.map((item, idx) => {
              if (idx + 1 < inforDocument?.Languages?.length) {
                return `${item[0]?.Text}, `
              }
              return item[0]?.Text
            })}
          </span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>????? m???t:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.SecurityLevel?.Text}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>B??t t??ch:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.IssuedDate}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Tr??ch y???u n???i dung:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.IssuedDate}</span>
        </Col>
      </RowWrapper>

      <div className="custom-col">
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>V???n ????? ch??nh:</b>
          </Col>
          <Col span={18}>
            <span>{inforDocument?.KeywordIssue}</span>
          </Col>
        </RowWrapper>
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>?????a danh:</b>
          </Col>
          <Col span={18}>
            <span>{inforDocument?.KeywordPlace}</span>
          </Col>
        </RowWrapper>
        <RowWrapper gutter={20}>
          <Col span={6}>
            <b>S??? ki???n:</b>
          </Col>
          <Col span={18}>
            <span>{inforDocument?.KeywordEvent}</span>
          </Col>
        </RowWrapper>
      </div>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ch?? gi???i:</b>
        </Col>
        <Col span={18}>
          <span>{inforDocument?.Description}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>T??nh tr???ng v???t l??:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.Format}</span>
        </Col>
        <Col span={6}>
          <b>Ch??? ????? s??? d???ng:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.Mode}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>M???c ????? tin c???y:</b>
        </Col>
        <Col span={6}>
          <span>{inforDocument?.ConfidenceLevel}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>File t??i li???u:</b>
        </Col>
        <Col span={6}>
          <a>T??i li???u.doc</a>
          <a>T??i li???u.doc</a>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>M?? h??? s?? l??u tr???:</b>
        </Col>
        <Col span={6}>
          <span>B??nh th?????ng</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Ti??u ????? h??? s??:</b>
        </Col>
        <Col span={6}>
          <span>B??nh th?????ng</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Kh??a:</b>
        </Col>
        <Col span={3}>
          <span>{inforDocument?.NationalAssembly?.CodeKey}</span>
        </Col>
        <Col span={4}>
          <b>K??? h???p th???:</b>
        </Col>
        <Col span={3}>
          <span>{inforDocument?.CongressMeeting?.CodeKey}</span>
        </Col>
        <Col span={4}>
          <b>Phi??n h???p:</b>
        </Col>
        <Col span={4}>
          <span>{inforDocument?.Meeting?.CodeKey}</span>
        </Col>
      </RowWrapper>
      <RowWrapper gutter={20}>
        <Col span={6}>
          <b>Th???i h???n b???o qu???n:</b>
        </Col>
        <Col span={9}>
          <Radio.Group value={inforDocument?.StorageTimeType}>
            <Radio value={1}>V??nh vi???n</Radio>
            <Radio value={2}>C?? th???i h???n</Radio>
          </Radio.Group>
        </Col>
        <Col span={3}>
          <Input value={inforDocument?.Maintenance} />
        </Col>
        <Col span={2}>N??m</Col>
      </RowWrapper>
      {/* Modals */}
      <ModalConfirmReception
        visible={isOpenModalConfirmReception}
        type="primary"
        data={inforDocument}
        onOk={onReceiveDocument}
        onCancel={() => setIsOpenModalConfirmReception(false)}
      />
      <ModalDenyReception
        visible={isOpenModalDenyReception}
        onOk={content => onRejectDocument(content)}
        onCancel={() => setIsOpenModalDenyReception(false)}
      />
    </ModalWrapper>
  )
}

ModalDetailDocument.defaultProps = {
  width: 756,
  className: 'atbd-modal'
}

ModalDetailDocument.propTypes = {
  onCancel: PropTypes.func,
  onReceive: PropTypes.func,
  onReject: PropTypes.func,
  visible: PropTypes.bool,
  documentObjectGuid: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  width: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
}

export default ModalDetailDocument
