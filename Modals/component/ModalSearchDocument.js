import React, { useEffect, useState } from 'react'
import PropTypes, { object } from 'prop-types'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { SearchOutlined } from '@ant-design/icons'
import { useToast } from '@chakra-ui/react'
import { Button, Form, Select, Row, Col, Space, Input, Tooltip, DatePicker } from 'antd'

// Service
import SearchDocumentService from 'src/api/SearchDocumentService'

// Components
import Icon from 'src/components/Icon/Icon'
import ButtonCustom from 'src/components/Button/Button'

// Style
import { SearchEasyWrapper } from 'src/pages/DataManagement/styled/DataManagementWrapper'
import { ModalWrapper, TableContentWrapper } from '../styled/ModalWrapper'

const { Option } = Select
const { Search } = Input

const initialValuesTicketSearch = {
  OrganID: null,
  PhotoType: 0,
  Form: 0,
  NationalAssembly: null,
  CongressMeeting: null,
  Meeting: null,
  TextSearch: '',
  RefType: 0,
  TypeName: null,
  CreateDateFrom: '',
  CreateDateTo: '',
  PageSize: 5,
  CurrentPage: 1
}
const ModalSearchDocument = props => {
  const { title, onCancel, className, onOk, visible, type, color, footer, width, listReferences, textSearch } = props
  const [formSearch] = Form.useForm()
  const toast = useToast()

  const { documentTypes, organName, nationalAssembly, congressMeeting, meeting } = useSelector(state => state.common)
  const [listDocumentTicketSearch, setListDocumentTicketSearch] = useState(listReferences)
  const [listDocumentMining, setListDocumentMining] = useState([])

  const [isShowAdvanceSearch, setIsShowAdvanceSearch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conditionSearch, setConditionSearch] = useState(initialValuesTicketSearch)

  const [paginationData, setPaginationData] = useState({
    CurrentPage: 1,
    PageSize: 5,
    TotalSearch: 0
  })

  useEffect(() => {
    if (visible) {
      formSearch.setFieldsValue({ ...conditionSearch, TextSearch: textSearch || '' })
      setConditionSearch({ ...conditionSearch, TextSearch: textSearch || '' })
      getListAdvancedTicketSearch({ ...conditionSearch, TextSearch: textSearch || '' })
      if (listReferences && listReferences.length) {
        setListDocumentMining(listReferences)
      } else {
        setListDocumentMining([])
      }
    }
  }, [visible])

  const getListAdvancedTicketSearch = body => {
    setIsLoading(true)
    setConditionSearch(body)
    SearchDocumentService.getListAdvancedTicketSearch(body)
      .then(res => {
        if (res.isError) return
        const newData = res.Object?.Data.map((item, index) => {
          return {
            ...item,
            key: index,
            isChecked: false,
            DocSubject: item.Title,
            ReferenID: item.RefID,
            ReferenType: item.RefType
          }
        })
        setPaginationData({
          CurrentPage: res.Object.CurrentPage,
          PageSize: res.Object.PageSize,
          TotalSearch: res.Object.TotalSearch
        })
        setListDocumentTicketSearch(newData)
        setListDocumentMiningChange(newData)
      })
      .finally(() => setIsLoading(false))
  }

  const setListDocumentMiningChange = listData => {
    let array = []
    if (listData && listData.length) {
      array = [...listData]
      if (listReferences && listReferences.length) {
        array.forEach((item, i) => {
          const arrcheck = listReferences.filter(ele => ele.ReferenID === item.ReferenID)
          if (arrcheck && arrcheck.length) {
            array[i].isChecked = true
          } else {
            array[i].isChecked = false
          }
        })
        setListDocumentTicketSearch(array)
      }
    }
  }

  const handleChange = allValues => {
    getListAdvancedTicketSearch({ ...conditionSearch, ...allValues, PageSize: 5, CurrentPage: 1 })
  }

  const handleChoiceItem = (value, index) => {
    if (listDocumentMining) {
      const list = listDocumentMining.filter(item => item.ReferenID === value.RefID)
      if (list && list.length) {
        toast({
          title: 'T??i li???u ???? ???????c ch???n',
          status: 'warning',
          position: 'bottom-right',
          duration: 2000
        })
      } else {
        const array = [...listDocumentTicketSearch]
        array[index].isChecked = true
        setListDocumentTicketSearch(array)
        const arr = [...listDocumentMining]
        arr.push({ ...value })
        setListDocumentMining(arr)
      }
    }
  }

  const handleDeleteItem = (data, idx) => {
    const arrayTicketSearch = [...listDocumentTicketSearch]
    if (arrayTicketSearch && arrayTicketSearch.length) {
      const objUncheck = arrayTicketSearch.find(ele => ele.RefID === data.ReferenID)
      if (objUncheck) {
        arrayTicketSearch.forEach((element, i) => {
          if (element.RefID === objUncheck.ReferenID) {
            arrayTicketSearch[i].isChecked = false
          }
        })
      }
      setListDocumentTicketSearch(arrayTicketSearch)
    }
    const arr = [...listDocumentMining]
    arr.splice(idx, 1)
    setListDocumentMining(arr)
  }

  const handleChangePage = (page, pageSize) => {
    getListAdvancedTicketSearch({
      ...conditionSearch,
      PageSize: pageSize,
      CurrentPage: page
    })
  }

  const disabledStartDate = current => {
    return current && current > moment(formSearch.getFieldValue('CreateDateTo')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(formSearch.getFieldValue('CreateDateFrom')).endOf('day')
  }

  const hanledOpenAdvSearchButton = () => {
    setIsShowAdvanceSearch(!isShowAdvanceSearch)
    formSearch.setFieldsValue({ ...initialValuesTicketSearch, TextSearch: conditionSearch.TextSearch })
    getListAdvancedTicketSearch({
      ...initialValuesTicketSearch,
      TextSearch: conditionSearch.TextSearch,
      PageSize: 5,
      CurrentPage: 1
    })
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 50,
      render: (value, record, index) => <>{(paginationData?.CurrentPage - 1) * paginationData?.PageSize + index + 1}</>
    },
    {
      title: 'Ti??u ?????',
      dataIndex: 'Title',
      key: 'Title'
    },
    {
      title: (
        <>
          <div className="font-weight-bold">S??? v?? K?? hi???u</div>
          {/* <div className="font-weight-bold">S??? l??u tr???</div> */}
        </>
      ),
      // align: 'center',
      dataIndex: 'Notation',
      key: 'Notation',
      width: 200,
      render: (value, record) => (
        <>
          <div>{record?.Notation}</div>
        </>
      )
    },
    {
      title: 'Thao t??c',
      align: 'center',
      key: 'acction',
      dataIndex: 'acction',
      width: 90,
      render: (value, record, index) => (
        <>
          {!record.isChecked ? (
            <>
              <Tooltip title="Th??m t??i li???u">
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleChoiceItem(record, index)}
                  icon={<Icon name="add_circle_outline" size={20} color="green" className="mx-auto" />}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                type="link"
                size="small"
                disabled
                icon={<Icon name="done_outline" size={20} color="green" className="mx-auto" />}
              />
            </>
          )}
        </>
      )
    }
  ]
  const columnsDataChoice = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 50,
      render: (text, record, index) => <div className="text-center">{index + 1}</div>
    },
    {
      title: 'Ti??u ?????',
      key: 'DocSubject',
      dataIndex: 'DocSubject'
    },
    {
      title: 'Thao t??c',
      align: 'center',
      dataIndex: 'acction',
      key: 'acction',
      width: 70,
      render: (value, record, index) => (
        <>
          <Tooltip title="X??a t??i li???u">
            <Button
              type="link"
              size="small"
              onClick={() => handleDeleteItem(record, index)}
              icon={<Icon name="delete" size={20} color="var(--color-red-600)" className="mx-auto" />}
            />
          </Tooltip>
        </>
      )
    }
  ]

  return (
    <ModalWrapper
      style={{ marginTop: 60 }}
      title={title}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      type={color ? type : false}
      width={width}
      className={className}
      destroyOnClose
      footer={
        footer || footer === null
          ? footer
          : [
              <Space>
                <Button
                  type="primary"
                  key="submit"
                  onClick={() => {
                    onOk(listDocumentMining)
                  }}
                >
                  X??c nh???n
                </Button>
                <Button type="secondary" key="back" onClick={onCancel}>
                  ????ng
                </Button>
              </Space>
            ]
      }
    >
      <div>
        <Form
          layout="vertical"
          form={formSearch}
          labelAlign="left"
          name="basic"
          initialValues={conditionSearch}
          onValuesChange={(changedValues, allValues) => {
            handleChange(allValues)
          }}
        >
          <SearchEasyWrapper>
            <Row justify="space-between" className="mb-10">
              <Col flex="1 1 auto">
                <Form.Item name="TextSearch">
                  <Search
                    placeholder="Nh???p ti??u ????? , S??? v?? k?? hi???u, S??? l??u tr??? , T??c gi???"
                    enterButton={<SearchOutlined style={{ fontSize: '24px' }} />}
                  />
                </Form.Item>
              </Col>
              <Tooltip title="" color="#2a2a2a" placement="left">
                <ButtonCustom
                  disable
                  text={!isShowAdvanceSearch ? 'M??? b??? l???c n??ng cao' : '????ng b??? l???c n??ng cao'}
                  type="primary"
                  size={15}
                  color="var(--color-primary)"
                  icon={
                    !isShowAdvanceSearch ? (
                      <Icon name="filter_alt" size={20} className="mx-auto" />
                    ) : (
                      <Icon name="keyboard_arrow_up" size={20} className="mx-auto" />
                    )
                  }
                  onClick={() => {
                    hanledOpenAdvSearchButton()
                  }}
                />
              </Tooltip>
            </Row>
          </SearchEasyWrapper>
          {isShowAdvanceSearch && (
            <Row justify="start" gutter="16">
              <Col span={8}>
                <Form.Item label="Lo???i t??i li???u" name="RefType">
                  <Select defaultValue={0} showArrow getPopupContainer={trigger => trigger.parentNode}>
                    <Option key="0" value={0}>
                      T???t c???
                    </Option>
                    <Option key="1" value={1}>
                      T??i li???u gi???y
                    </Option>
                    <Option key="2" value={2}>
                      T??i li???u phim ???nh
                    </Option>
                    <Option key="3" value={3}>
                      T??i li???u phim, ??m thanh
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Lo???i v??n b???n" name="TypeName">
                  <Select getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {documentTypes &&
                      documentTypes.length &&
                      documentTypes.map((item, idx) => (
                        <Option key={idx} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="OrganID" label="CQ, t??? ch???c ban h??nh">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {!!organName &&
                      !!organName.length &&
                      organName.map((item, idx) => (
                        <Option key={idx} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="NationalAssembly" label="Kh??a">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {nationalAssembly &&
                      nationalAssembly.length &&
                      nationalAssembly.map((item, idx) => (
                        <Option key={idx} value={Number(item.CodeValue)}>
                          Kh??a {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="CongressMeeting"
                  label="K??? h???p"
                  rules={[
                    {
                      required: false,
                      message: 'Vui l??ng nh???p K??? h???p!'
                    }
                  ]}
                >
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {congressMeeting.map((item, idx) => (
                      <Option key={idx} value={Number(item.CodeValue)}>
                        K??? h???p th??? {item.Text}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="Meeting"
                  label="Phi??n h???p"
                  rules={[
                    {
                      required: false,
                      message: 'Vui l??ng nh???p Phi??n h???p!'
                    }
                  ]}
                >
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {meeting.map((item, idx) => (
                      <Option key={idx} value={Number(item.CodeValue)}>
                        Phi??n h???p th??? {item.Text}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="PhotoType" label="Lo???i h??nh">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option key="0" value={0}>
                      T???t c???
                    </Option>
                    <Option key="1" value={1}>
                      Ch??n dung
                    </Option>
                    <Option key="2" value={2}>
                      Ho???t ?????ng
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="Form" label="H??nh th???c">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option key="0" value={0}>
                      T???t c???
                    </Option>
                    <Option key="1" value={1}>
                      D????ng b???n
                    </Option>
                    <Option key="2" value={2}>
                      ??m b???n
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="CreateDateFrom" label="Th???i gian t???">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n ng??y"
                    disabledDate={disabledStartDate}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="CreateDateTo" label="?????n">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n ng??y"
                    disabledDate={disabledEndDate}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>

        <TableContentWrapper
          className="table-list-document"
          loading={isLoading}
          columns={columns}
          dataSource={listDocumentTicketSearch}
          pagination={
            paginationData.TotalSearch > 5 && {
              pageSize: paginationData.PageSize,
              current: paginationData.CurrentPage,
              total: paginationData.TotalSearch,
              pageSizeOptions: ['10', '20', '50', '100'],
              showSizeChanger: true,
              locale: { items_per_page: '' },
              onChange: (page, pageSize) => handleChangePage(page, pageSize)
            }
          }
        />
        <b>Danh s??ch t??i li???u khai th??c: {listDocumentMining?.length}</b>
        <TableContentWrapper
          showHeader={false}
          className="table-list-document"
          columns={columnsDataChoice}
          dataSource={listDocumentMining}
          scroll={{ y: '35vh' }}
          pagination={false}
        />
      </div>
    </ModalWrapper>
  )
}

ModalSearchDocument.defaultProps = {
  width: 1000,
  className: 'margin-top-modal'
}

ModalSearchDocument.propTypes = {
  title: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  visible: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  footer: PropTypes.arrayOf(object),
  width: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  listReferences: PropTypes.arrayOf(object),
  textSearch: PropTypes.string
}

export { ModalSearchDocument }
