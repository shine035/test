import React, { useEffect, useState } from 'react'
import PropTypes, { object } from 'prop-types'
import { useSelector } from 'react-redux'
import { Button, Form, DatePicker, Row, Col, Radio, Space, Input, Spin, Tooltip, Select, Checkbox } from 'antd'

import { useToast } from '@chakra-ui/react'
import moment from 'moment'
import {
  SearchOutlined,
  PrinterOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  MinusCircleOutlined
} from '@ant-design/icons'

// API
import AccountDeptService from 'src/api/AccountDeptService'
import TicketService from 'src/api/TicketService'

// Component
import { ModalSearchDocument } from 'src/components/Modals/component/ModalSearchDocument'
import { ModalDeleteTicket } from 'src/pages/Ticket/ListTicket/components/ModalDeleteTicket'
import { ModalTransferTicket } from 'src/pages/Ticket/ListTicket/components/ModalTransferTicket'

import Icon from 'src/components/Icon/Icon'

// Helpers
import { exportExcelURL } from 'src/helpers/index'
import { filterSelect } from 'src/helpers/string'

// Style
import { ModalDenyReceptionTicket } from 'src/pages/Ticket/ListTicket/components/ModalDenyReceptionTicket'
import { ModalWrapper, TableContentWrapper } from 'src/components/Modals/styled/ModalWrapper'
import { FormDataMiningTitle, FormDataMiningWrapper } from 'src/components/Modals/styled/FormDataMiningWrapper'

const { Option, OptGroup } = Select
const { Search } = Input

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

const initialValuesForm = {
  StartDate: moment(new Date()),
  EndDate: '',
  Purpose: '',
  Type: 1,
  ListReferences: [],
  UserID: '',
  IsReturn: false
}

const ModalDataMiningTicket = props => {
  const { onCancel, className, onOk, visible, footer, dataTicket } = props

  const toast = useToast()
  const [formMining] = Form.useForm()
  const { user } = useSelector(state => state.auth)
  const { roleTypeID, ticketStatus, ticketMiningType } = useSelector(state => state.common)
  const [isLoading, setIsLoading] = useState(false)
  const [dataSearch, setDataSearch] = useState('')
  const [isTicket, setIsTicket] = useState({})
  const [listReferences, setListReferences] = useState([])
  const [listObjectGuid, setListObjectGuid] = useState([])
  const [dataTicketDetail, setDataTicketDetail] = useState({})
  const [listUserManager, setListUserManager] = useState([{ ...user }])
  const [isOpenModalDeleteTicket, setIsOpenModalDeleteTicket] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)
  const [isOpenModalSearchDocument, setOpenModalSearchDocument] = useState(false)
  const [isShowModalTransferTicket, setIsShowModalTransferTicket] = useState(false)

  useEffect(() => {
    setDataTicketDetail({})
    setListUserManager([user])
    if (!visible) {
      formMining.resetFields()
      setDataTicketDetail({})
      setListUserManager([user])
      setListReferences([])
      setListObjectGuid([])
      return
    }
    if (!dataTicket) {
      setIsTicket(false)
      setDataTicketDetail({})
      if (roleTypeID !== 5) {
        getListUserManager('')
      } else {
        setListUserManager([user])
        if (user?.UserID) {
          formMining.setFieldsValue({
            Organization: user?.UserDeptName,
            Address: user?.Address || '',
            Phone: user?.Phone || '',
            FullName: user?.FullName || '',
            UserID: user?.UserID || ''
          })
        }
      }
    } else {
      setIsTicket(true)
      if (roleTypeID !== 5) {
        getListUserManager('')
      } else {
        setListUserManager([user])
        if (user?.UserID) {
          formMining.setFieldsValue({
            Organization: user?.UserDeptName,
            Address: user?.Address || '',
            Phone: user?.Phone || '',
            FullName: user?.FullName || '',
            UserID: user?.UserID || ''
          })
        }
        getOneTicketByObjectGuid(dataTicket?.ObjectGuid)
      }
    }
  }, [visible])

  const getListUserManager = fullName => {
    AccountDeptService.getListUserByDirectory(fullName).then(res => {
      if (res?.isError) return
      if (res?.Object) {
        const listUser = res?.Object.filter(item => item?.AccountUsers.length > 0)
        setListUserManager(listUser)
        if (dataTicket?.ObjectGuid) {
          getOneTicketByObjectGuid(dataTicket?.ObjectGuid)
        } else {
          formMining.setFieldsValue({
            ...formMining,
            Organization: user?.UserDeptName,
            Address: user?.Address || '',
            Phone: user?.Phone || '',
            FullName: user?.FullName || '',
            UserID: user?.UserID || ''
          })
        }
      }
    })
  }

  const getOneTicketByObjectGuid = ObjectGuid => {
    if (!ObjectGuid) return
    setIsLoading(true)
    TicketService.getOne(ObjectGuid)
      .then(res => {
        if (res.isError) return
        setDataTicketDetail(res.Object)

        formMining.setFieldsValue({
          ...formMining,
          Organization: res.Object?.Organization,
          Address: res.Object?.Address,
          Phone: res.Object?.Phone,
          FullName: res.Object?.FullName,
          UserID: res.Object?.UserID,
          Purpose: res.Object?.Purpose,
          Type: res.Object?.Type,
          TicketStatus: res.Object?.TicketStatus,
          TicketNo: res.Object?.TicketNo,
          IsReturn: res.Object?.TicketStatus === 8,
          EndDate: moment(res.Object?.EndDate),
          StartDate: moment(res.Object?.StartDate)
        })
        const newData = res.Object?.ListReferences.map(item => {
          return {
            ...item,
            key: item?.ReferenID
          }
        })
        setListReferences(newData)
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangeForm = value => {
    if (value.UserID) {
      if (listUserManager && listUserManager.length) {
        listUserManager.forEach(item => {
          if (item?.AccountUsers && item?.AccountUsers.length) {
            const infoUser = item?.AccountUsers.filter(dataUser => dataUser?.UserID === value?.UserID)
            if (infoUser && infoUser.length === 1) {
              formMining.setFieldsValue({
                Organization: infoUser[0]?.DeptName || '',
                Address: infoUser[0]?.Address || '',
                Phone: infoUser[0]?.Phone || '',
                FullName: infoUser[0]?.FullName || '',
                UserID: infoUser[0]?.UserID || ''
              })
            }
          }
        })
      }
    } else {
      formMining.setFieldsValue({
        Organization: '',
        Address: '',
        Phone: '',
        FullName: '',
        UserID: null
      })
    }
  }

  const disabledEndDate = current => {
    return current && current < moment(formMining.getFieldValue('StartDate'))
  }

  const denyReceptionOK = reason => {
    if (!listObjectGuid) return
    const newData = listObjectGuid.map(item => {
      return {
        Content: item?.ListReferences[0].DocSubject,
        ObjectGuid: item?.ObjectGuid
      }
    })
    setIsLoading(true)
    const newbody = {
      reasonReject: reason.Content,
      TicketList: newData
    }
    setIsLoading(true)
    TicketService.reject(newbody)
      .then(res => {
        if (res.isError) return
        toast({
          title: 'Phi???u ???? b??? t??? ch???i',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        if (res?.isOk) {
          onOk()
          setIsOpenModalDenyReception(false)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const handleSubmitForm = values => {
    formMining.validateFields().then(() => {
      let arr = []
      arr =
        listReferences &&
        listReferences.length &&
        listReferences.map(element => {
          return { ReferenID: element.ReferenID, ReferenType: element.ReferenType }
        })
      const body = {
        ObjectGuid: dataTicketDetail?.ObjectGuid,
        StartDate: moment(new Date()),
        EndDate: values.EndDate,
        Purpose: values.Purpose,
        Type: values.Type,
        ListReferences: arr || [],
        UserID: values.UserID,
        IsReturn: values.IsReturn || false
      }
      if (body.ListReferences && body.ListReferences.length) {
        setIsLoading(true)
        TicketService.insertUpdateTicket(body)
          .then(res => {
            if (res?.isError) return
            toast({
              title: dataTicketDetail?.ObjectGuid ? 'C???p nh???t phi???u th??nh c??ng' : 'L???p m???i phi???u th??nh c??ng',
              status: 'success',
              position: 'bottom-right',
              duration: 2000,
              isClosable: true
            })
            formMining.resetFields()
            if (res?.isOk) {
              onOk()
            }
          })
          .finally(() => setIsLoading(false))
      } else {
        toast({
          title: 'B???n ch??a ch???n t??i li???u khai th??c. Vui l??ng ch???n l???i!',
          status: 'warning',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
      }
    })
  }

  const getListDocumentChoice = listDocumentChoice => {
    setOpenModalSearchDocument(false)
    setListReferences(listDocumentChoice)
  }

  const handleDeleteItem = idx => {
    const arr = [...listReferences]
    arr.splice(idx, 1)
    setListReferences(arr)
  }

  const deleteOK = () => {
    setIsLoading(true)
    TicketService.delete({
      ObjectGuid: dataTicketDetail?.ObjectGuid
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'Phi???u ???? x??a th??nh c??ng',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setIsOpenModalDeleteTicket(false)
        onCancel()
        if (res?.isOk) {
          onOk()
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const exportFilePDF = () => {
    TicketService.exportPDF({ ObjectGuid: dataTicket?.ObjectGuid }).then(res => {
      if (res?.isError) return
      exportExcelURL(res?.Object)
    })
  }

  const transferTicket = () => {
    setIsShowModalTransferTicket(true)
  }

  const transferTicketOK = () => {
    if (!listReferences) return
    setIsLoading(true)
    const newbody = {
      TicketList: [
        {
          Content: listReferences[0]?.DocSubject || '',
          ObjectGuid: dataTicketDetail?.ObjectGuid
        }
      ]
    }
    TicketService.approve(newbody)
      .then(res => {
        if (res.isError) return
        toast({
          title: 'Phi???u ???? ???????c duy???t v?? chuy???n',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        if (res?.isOk) {
          setIsShowModalTransferTicket(false)
          onCancel()
          onOk()
        }
      })
      .finally(() => setIsLoading(false))
  }

  const acceptTicket = () => {
    if (!listReferences) return
    setIsLoading(true)
    const newbody = {
      TicketList: [
        {
          Content: listReferences[0]?.DocSubject || '',
          ObjectGuid: dataTicketDetail?.ObjectGuid
        }
      ]
    }
    TicketService.approve(newbody)
      .then(res => {
        if (res.isError) return
        toast({
          title: 'Phi???u ???? ???????c duy???t',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        if (res?.isOk) {
          onCancel()
          onOk()
        }
      })
      .finally(() => setIsLoading(false))
  }

  const columnsChoice = [
    {
      title: 'Ti??u ?????',
      key: 'DocSubject',
      dataIndex: 'DocSubject',
      render: (text, row, index) => (
        <div>
          {index + 1}. {text}
        </div>
      )
    },
    {
      title: 'Thao t??c',
      align: 'center',
      dataIndex: 'acction',
      key: 'acction',
      width: 80,
      render: (value, record, index) => (
        <>
          {dataTicketDetail?.TicketStatus !== 6 &&
            dataTicketDetail?.TicketStatus !== 7 &&
            dataTicketDetail?.TicketStatus !== 4 &&
            dataTicketDetail?.TicketStatus !== 8 &&
            roleTypeID !== 3 && (
              <Tooltip title="X??a t??i li???u">
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleDeleteItem(index)}
                  icon={<Icon name="delete" size={20} color="var(--color-red-600)" className="mx-auto" />}
                />
              </Tooltip>
            )}
        </>
      )
    }
  ]
  return (
    <ModalWrapper
      title={
        dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000'
          ? 'Chi ti???t phi???u khai th??c t??i li???u'
          : 'L???p m???i phi???u khai th??c t??i li???u'
      }
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      closable={false}
      width={765}
      className={className}
      destroyOnClose
      footer={
        footer || footer === null
          ? footer
          : [
              <div key="footer">
                {roleTypeID === 1 && (
                  <div
                    className={
                      dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000'
                        ? 'd-flex justify-content-between'
                        : ''
                    }
                  >
                    {dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000' && (
                      <Space>
                        <Button
                          type="danger"
                          icon={<DeleteOutlined />}
                          onClick={() => setIsOpenModalDeleteTicket(true)}
                        >
                          X??a
                        </Button>
                        <Button
                          type="danger"
                          icon={<MinusCircleOutlined />}
                          onClick={e => {
                            e.stopPropagation()
                            setListObjectGuid([dataTicketDetail])
                            setIsOpenModalDenyReception(true)
                          }}
                        >
                          T??? ch???i
                        </Button>
                        <Button
                          type="secondary"
                          icon={<PrinterOutlined />}
                          onClick={() => exportFilePDF()}
                          style={{ paddingRight: 10 }}
                        >
                          In phi???u
                        </Button>
                      </Space>
                    )}

                    <Space>
                      <Button type="primary" key="submit" htmlType="submit" form="formMining" icon={<SaveOutlined />}>
                        {dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000'
                          ? 'Ghi l???i'
                          : 'L???p phi???u'}
                      </Button>
                      <Button
                        type="secondary"
                        key="back"
                        onClick={() => {
                          onCancel()
                        }}
                        icon={<CloseOutlined />}
                      >
                        ????ng
                      </Button>
                    </Space>
                  </div>
                )}

                {roleTypeID === 2 && (
                  <div className={isTicket ? 'd-flex justify-content-between' : ''}>
                    {isTicket && (
                      <Space>
                        <Button type="secondary" icon={<PrinterOutlined />} onClick={() => exportFilePDF()}>
                          In phi???u
                        </Button>
                        {dataTicketDetail?.TicketStatus === 5 && (
                          <Button
                            type="danger"
                            icon={<MinusCircleOutlined />}
                            onClick={e => {
                              e.stopPropagation()
                              setListObjectGuid([dataTicketDetail])
                              setIsOpenModalDenyReception(true)
                            }}
                          >
                            T??? ch???i
                          </Button>
                        )}
                      </Space>
                    )}
                    <Space>
                      {isTicket && dataTicketDetail?.TicketStatus === 5 && (
                        <>
                          <Button type="primary" icon={<SaveOutlined />} onClick={transferTicket}>
                            Duy???t phi???u
                          </Button>
                        </>
                      )}
                      {dataTicketDetail?.TicketStatus !== 4 &&
                        dataTicketDetail?.TicketStatus !== 3 &&
                        dataTicketDetail?.TicketStatus !== 8 &&
                        dataTicketDetail?.TicketStatus !== 5 && (
                          <Button
                            type="primary"
                            key="submit"
                            htmlType="submit"
                            form="formMining"
                            icon={<SaveOutlined />}
                          >
                            {dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000'
                              ? 'Ghi l???i'
                              : 'L???p phi???u'}
                          </Button>
                        )}
                      <Button
                        type="secondary"
                        key="back"
                        onClick={() => {
                          onCancel()
                        }}
                        icon={<CloseOutlined />}
                      >
                        ????ng
                      </Button>
                    </Space>
                  </div>
                )}

                {roleTypeID === 3 && (
                  <div className={isTicket ? 'd-flex justify-content-between' : ''}>
                    {isTicket && (
                      <Space>
                        <Button type="secondary" icon={<PrinterOutlined />} onClick={() => exportFilePDF()}>
                          In phi???u
                        </Button>
                        {dataTicketDetail?.TicketStatus === 3 && (
                          <Button
                            type="danger"
                            icon={<MinusCircleOutlined />}
                            onClick={e => {
                              e.stopPropagation()
                              setListObjectGuid([dataTicketDetail])
                              setIsOpenModalDenyReception(true)
                            }}
                          >
                            T??? ch???i
                          </Button>
                        )}
                      </Space>
                    )}
                    <Space>
                      {isTicket && dataTicketDetail?.TicketStatus === 3 && (
                        <Button type="primary" icon={<SaveOutlined />} onClick={transferTicket}>
                          Duy???t v?? Chuy???n
                        </Button>
                      )}

                      {dataTicketDetail?.TicketStatus !== 4 &&
                        dataTicketDetail?.TicketStatus !== 3 &&
                        dataTicketDetail?.TicketStatus !== 8 &&
                        dataTicketDetail?.TicketStatus !== 5 && (
                          <Button
                            type="primary"
                            key="submit"
                            htmlType="submit"
                            form="formMining"
                            icon={<SaveOutlined />}
                          >
                            {dataTicket?.ObjectGuid && dataTicket?.ObjectGuid !== '00000000-0000-0000-0000-000000000000'
                              ? 'Ghi l???i'
                              : 'L???p phi???u'}
                          </Button>
                        )}

                      <Button type="secondary" key="back" onClick={onCancel} icon={<CloseOutlined />}>
                        ????ng
                      </Button>
                    </Space>
                  </div>
                )}

                {roleTypeID === 4 && (
                  <div className={isTicket ? 'd-flex justify-content-between' : ''}>
                    {isTicket && (
                      <Space>
                        {[1, 3, 5].includes(dataTicketDetail?.TicketStatus) && (
                          <Button
                            type="danger"
                            icon={<DeleteOutlined />}
                            onClick={() => setIsOpenModalDeleteTicket(true)}
                          >
                            X??a
                          </Button>
                        )}

                        <Button type="secondary" icon={<PrinterOutlined />} onClick={() => exportFilePDF()}>
                          In phi???u
                        </Button>
                      </Space>
                    )}

                    <Space>
                      {dataTicketDetail?.TicketStatus === 1 && (
                        <>
                          {isTicket && (
                            <Button type="primary" icon={<SaveOutlined />} onClick={acceptTicket}>
                              ?????ng ??
                            </Button>
                          )}
                        </>
                      )}

                      {!isTicket && (
                        <Button type="primary" key="submit" htmlType="submit" form="formMining" icon={<SaveOutlined />}>
                          L???p phi???u
                        </Button>
                      )}
                      {isTicket && dataTicketDetail?.TicketStatus !== 8 && (
                        <Button type="primary" key="submit" htmlType="submit" form="formMining" icon={<SaveOutlined />}>
                          Ghi l???i
                        </Button>
                      )}
                      <Button type="secondary" key="back" onClick={onCancel} icon={<CloseOutlined />}>
                        ????ng
                      </Button>
                    </Space>
                  </div>
                )}

                {roleTypeID === 5 && (
                  <div className={isTicket ? 'd-flex justify-content-between' : ''}>
                    {isTicket && (
                      <Space>
                        {[1, 3, 5].includes(dataTicketDetail?.TicketStatus) && (
                          <Button
                            type="danger"
                            icon={<DeleteOutlined />}
                            onClick={() => setIsOpenModalDeleteTicket(true)}
                          >
                            X??a
                          </Button>
                        )}

                        <Button type="secondary" icon={<PrinterOutlined />} onClick={() => exportFilePDF()}>
                          In phi???u
                        </Button>
                      </Space>
                    )}

                    <Space>
                      {dataTicketDetail?.ObjectGuid && (
                        <>
                          {![4, 2, 7, 6, 8].includes(dataTicketDetail?.TicketStatus) && (
                            <Button
                              type="primary"
                              key="submit"
                              htmlType="submit"
                              form="formMining"
                              icon={<SaveOutlined />}
                            >
                              Ghi l???i
                            </Button>
                          )}
                        </>
                      )}
                      {!dataTicketDetail?.ObjectGuid && dataTicketDetail?.TicketStatus !== 8 && (
                        <>
                          <Button
                            type="primary"
                            key="submit"
                            htmlType="submit"
                            form="formMining"
                            icon={<SaveOutlined />}
                          >
                            L???p phi???u
                          </Button>
                        </>
                      )}

                      <Button type="secondary" key="back" onClick={onCancel} icon={<CloseOutlined />}>
                        ????ng
                      </Button>
                    </Space>
                  </div>
                )}
              </div>
            ]
      }
    >
      <FormDataMiningWrapper>
        <Form
          form={formMining}
          id="formMining"
          initialValues={initialValuesForm}
          onValuesChange={(changedValues, allValues) => handleChangeForm(allValues)}
          onFinish={handleSubmitForm}
          layout="horizontal"
        >
          <Spin size="small" spinning={isLoading}>
            <FormDataMiningTitle>
              <p className="top-title">Phi???u y??u c???u khai th??c d??? li???u</p>
              <i>
                S??? phi???u:{' '}
                {dataTicket?.ObjectGuid &&
                  dataTicketDetail?.ObjectGuid !== '00000000-0000-0000-0000-000000000000' &&
                  dataTicketDetail?.TicketNo}
              </i>
            </FormDataMiningTitle>
            <Form.Item
              {...layout}
              label="H??? t??n ng?????i y??u c???u"
              name="UserID"
              rules={[
                {
                  required: true,
                  message: 'Vui l??ng nh???p H??? v?? t??n ng?????i y??u c???u'
                }
              ]}
            >
              {roleTypeID !== 5 ? (
                <Select
                  disabled={
                    dataTicketDetail?.TicketStatus === 4 ||
                    dataTicketDetail?.TicketStatus === 8 ||
                    (dataTicketDetail?.TicketStatus === 3 && roleTypeID === 3) ||
                    (dataTicketDetail?.TicketStatus === 5 && roleTypeID === 3)
                  }
                  placeholder="Ch???n"
                  getPopupContainer={trigger => trigger.parentNode}
                  showSearch
                  filterOption={filterSelect}
                >
                  {listUserManager &&
                    listUserManager.length &&
                    listUserManager.map((item, index) => (
                      <OptGroup key={index} label={item?.DeptName}>
                        {item.AccountUsers &&
                          item.AccountUsers.length &&
                          item.AccountUsers.map((itemUser, idx) => (
                            <Option key={`${index}-${idx}`} value={itemUser.UserID}>
                              {itemUser.FullName}
                            </Option>
                          ))}
                      </OptGroup>
                    ))}
                </Select>
              ) : (
                <Select
                  disabled={dataTicketDetail?.TicketStatus === 4 || dataTicketDetail?.TicketStatus === 8}
                  placeholder="Ch???n"
                  getPopupContainer={trigger => trigger.parentNode}
                >
                  {listUserManager &&
                    listUserManager.length &&
                    listUserManager.map((item, idx) => (
                      <Option key={idx} value={item.UserID}>
                        {item.FullName} ({item.UserName})
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item {...layout} label="C?? quan, ????n v???" name="Organization">
              <Input readOnly />
            </Form.Item>
            <Form.Item {...layout} label="S??? ??i???n tho???i" name="Phone">
              <Input readOnly />
            </Form.Item>
            <Form.Item {...layout} label="?????a ch??? li??n h???" name="Address">
              <Input readOnly />
            </Form.Item>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item name="StartDate" label="Ng??y b???t ?????u" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                  <DatePicker
                    disabled
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY HH:mm"
                    showTime
                    placeholder="Ch???n ng??y"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="EndDate"
                  label="K???t th??c"
                  rules={[
                    {
                      required: true,
                      message: 'Ng??y K???t th??c ph???i l???n h??n ng??y b???t ?????u!'
                    }
                  ]}
                >
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY HH:mm"
                    showTime
                    placeholder="Ch???n ng??y"
                    disabledDate={disabledEndDate}
                    disabled={
                      dataTicketDetail?.TicketStatus === 4 ||
                      dataTicketDetail?.TicketStatus === 8 ||
                      (dataTicketDetail?.TicketStatus === 3 && roleTypeID === 3) ||
                      (dataTicketDetail?.TicketStatus === 5 && roleTypeID === 3)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="M???c ????ch khai th??c, s??? d???ng t??i li???u"
              name="Purpose"
              rules={[
                {
                  required: true,
                  message: 'Vui l??ng nh???p M???c ????ch khai th??c, s??? d???ng t??i li???u'
                },
                {
                  max: 3000,
                  message: 'Vui l??ng nh???p M???c ????ch khai th??c, s??? d???ng t??i li???u kh??ng qu?? 3000 k?? t???'
                }
              ]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input.TextArea
                rows={3}
                style={{ width: '100%' }}
                disabled={
                  dataTicketDetail?.TicketStatus === 4 ||
                  dataTicketDetail?.TicketStatus === 8 ||
                  (dataTicketDetail?.TicketStatus === 3 && roleTypeID === 3) ||
                  (dataTicketDetail?.TicketStatus === 5 && roleTypeID === 3)
                }
              />
            </Form.Item>
            <Form.Item
              name="Type"
              label="H??nh th???c khai th??c/Chuy???n t??i li???u"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Radio.Group
                style={{ paddingLeft: '25px' }}
                disabled={
                  dataTicketDetail?.TicketStatus === 4 ||
                  dataTicketDetail?.TicketStatus === 8 ||
                  (dataTicketDetail?.TicketStatus === 3 && roleTypeID === 3) ||
                  (dataTicketDetail?.TicketStatus === 5 && roleTypeID === 3)
                }
              >
                <Space direction="horizontal">
                  {ticketMiningType &&
                    ticketMiningType.length &&
                    ticketMiningType.map((item, idx) => (
                      <Radio key={idx} className="d-block" value={Number(item.CodeValue)}>
                        {item.Text}
                      </Radio>
                    ))}
                </Space>
              </Radio.Group>
            </Form.Item>
            <Row>
              <Col span={24}>
                <Form.Item label="T??n t??i li???u *" name="KeyWord" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <Search
                    disabled={
                      dataTicketDetail?.TicketStatus === 4 ||
                      dataTicketDetail?.TicketStatus === 8 ||
                      (dataTicketDetail?.TicketStatus === 3 && roleTypeID === 3) ||
                      (dataTicketDetail?.TicketStatus === 5 && roleTypeID === 3)
                    }
                    placeholder="Nh???p ti??u ????? t??i li???u"
                    enterButton={
                      <>
                        <SearchOutlined /> <span> T??m ki???m</span>
                      </>
                    }
                    onSearch={(value, e) => {
                      e.preventDefault()
                      setDataSearch(value)
                      setOpenModalSearchDocument(true)
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            {listReferences && listReferences.length > 0 && (
              <Row>
                <Col span={24}>
                  <div className="demo-infinite-container mb-2">
                    <TableContentWrapper
                      showHeader={false}
                      className="table-list-document"
                      columns={columnsChoice}
                      dataSource={listReferences}
                      scroll={{ y: '35vh' }}
                      pagination={false}
                    />
                  </div>
                </Col>
              </Row>
            )}
            {dataTicketDetail?.ObjectGuid && roleTypeID === 4 && (
              <>
                <Row gutter={10} className="ant-form-item">
                  <Col span={24}>
                    <Form.Item label="Tr???ng th??i" name="TicketStatus">
                      <Select disabled placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                        {ticketStatus &&
                          ticketStatus.length &&
                          ticketStatus.map((item, idx) => (
                            <Option key={idx + 1} value={Number(item.CodeValue)}>
                              {item.Text} ({item.CodeKey})
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="IsReturn" valuePropName="checked" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <Checkbox
                    disabled={
                      (dataTicketDetail?.TicketStatus === 1 && user?.UserID !== dataTicketDetail?.UserID) ||
                      dataTicketDetail?.TicketStatus === 3 ||
                      dataTicketDetail?.TicketStatus === 5 ||
                      dataTicketDetail?.TicketStatus === 8
                    }
                  >
                    ???? tr???
                  </Checkbox>
                </Form.Item>
              </>
            )}
          </Spin>
        </Form>

        <ModalSearchDocument
          visible={isOpenModalSearchDocument}
          type="primary"
          title="Danh s??ch t??i li???u"
          listReferences={listReferences}
          onOk={getListDocumentChoice}
          className="search-document"
          textSearch={dataSearch}
          onCancel={() => setOpenModalSearchDocument(false)}
        />

        <ModalDeleteTicket
          visible={isOpenModalDeleteTicket}
          type="primary"
          onOk={deleteOK}
          onCancel={() => setIsOpenModalDeleteTicket(false)}
        />

        <ModalTransferTicket
          visible={isShowModalTransferTicket}
          type="primary"
          data={dataTicketDetail}
          onOk={transferTicketOK}
          onCancel={() => setIsShowModalTransferTicket(false)}
        />

        <ModalDenyReceptionTicket
          visible={isOpenModalDenyReception}
          type="primary"
          onOk={denyReceptionOK}
          onCancel={() => setIsOpenModalDenyReception(false)}
          data={dataTicketDetail}
          listObjectGuid={listObjectGuid}
        />
      </FormDataMiningWrapper>
    </ModalWrapper>
  )
}

ModalDataMiningTicket.defaultProps = {
  className: 'atbd-modal'
}

ModalDataMiningTicket.propTypes = {
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  className: PropTypes.string,
  footer: PropTypes.arrayOf(object),
  top: PropTypes.number,
  visible: PropTypes.bool,
  dataTicket: PropTypes.object,
  type: PropTypes.string,
  width: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
}

export { ModalDataMiningTicket }
