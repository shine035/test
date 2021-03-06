import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select, DatePicker, Input, Tooltip } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import FadeIn from 'react-fade-in'
import { useSelector } from 'react-redux'
import moment from 'moment'

// Service
import CommonService from 'src/api/CommonService'

// Component
import ButtonCustom from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'

// Helpers
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Style
import { SystemAdvanceSearchWrapper, SearchEasyWrapper } from '../styled/DataManagementWrapper'

const { Option } = Select
const { Search } = Input

function SystemAdvanceSearch({ handleChangeEasySearch, handleChangeAdvanceSearch, conditionSearch }) {
  const [form] = Form.useForm()
  const { nationalAssembly, congressMeeting, meeting, securityLevel } = useSelector(state => state.common)
  const [isShowAdvanceSearch, setIsShowAdvanceSearch] = useState(false)
  const [isChangeAdvanceSearch, setIsChangeAdvanceSearch] = useState(false)
  const [listRacking, setListRacking] = useState([])
  const [listCompartment, setListCompartment] = useState([])
  const [listFileRowNumber, setListFileRowNumber] = useState([])
  const [listGear, setListGear] = useState([])

  useEffect(() => {
    if (isShowAdvanceSearch) {
      form.setFieldsValue({ ...conditionSearch })
      getInventoryByType(1)
    } else if (isChangeAdvanceSearch) {
      setIsChangeAdvanceSearch(false)
      form.setFieldsValue({ ...conditionSearch })
      handleChangeAdvanceSearch({
        TextSearch: '',
        Racking: null,
        Compartment: null,
        FileRowNumber: null,
        Gear: '',
        NationalAssembly: null,
        CongressMeeting: null,
        Meeting: null,
        SecurityLevel: null,
        StartDate: null,
        EndDate: null,
        Rights: null,
        FileStatus: null,
        PageSize: 20,
        CurrentPage: 1
      })
    }
  }, [isShowAdvanceSearch, isChangeAdvanceSearch])

  const getInventoryByType = typeId => {
    if (typeId === 1 && listRacking && listRacking.length) return
    CommonService.getInventoryByType(typeId).then(res => {
      if (res.isError) return
      switch (typeId) {
        case 1:
          setListRacking(res?.Object)
          break
        case 2:
          setListCompartment(res?.Object)
          break
        case 3:
          setListFileRowNumber(res?.Object)
          break
        default:
          break
      }
    })
  }

  const getListChildInventory = (Id, type) => {
    CommonService.getListChildInventory(Id).then(res => {
      if (res.isError) return
      if (res?.Object && res?.Object.length) {
        switch (type) {
          case 1:
            setListCompartment(res?.Object.filter(item => item.ParentID === Id && item.Type === 2))
            break
          case 2:
            setListFileRowNumber(res?.Object.filter(item => item.ParentID === Id && item.Type === 3))
            break
          case 3:
            setListGear(res?.Object.filter(item => item.ParentID === Id && item.Type === 4))
            break
          default:
            break
        }
      }
    })
  }

  const handleChange = (changedValues, value) => {
    const filedName = Object.keys(changedValues)[0]
    const bodySearch = { ...conditionSearch, ...value }
    if (filedName === 'Racking') {
      if (value.Racking) {
        getListChildInventory(value.Racking, 1)
      }
      bodySearch.Compartment = null
      bodySearch.FileRowNumber = null
      bodySearch.Gear = ''
      form.setFieldsValue({ Compartment: null, FileRowNumber: null, Gear: '' })
      setListCompartment([])
      setListFileRowNumber([])
      setListGear([])
    } else if (filedName === 'Compartment') {
      if (value.Compartment) {
        getListChildInventory(value.Compartment, 2)
      }
      bodySearch.FileRowNumber = null
      bodySearch.Gear = ''
      form.setFieldsValue({ FileRowNumber: null, Gear: '' })
      setListFileRowNumber([])
      setListGear([])
    } else if (filedName === 'FileRowNumber') {
      if (value.FileRowNumber) {
        getListChildInventory(value.FileRowNumber, 3)
      }
      bodySearch.Gear = ''
      form.setFieldsValue({ Gear: '' })
      setListGear([])
    }
    handleChangeAdvanceSearch(bodySearch)
  }

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('EndDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('StartDate')).endOf('day')
  }

  return (
    <SystemAdvanceSearchWrapper>
      <SearchEasyWrapper>
        <Row justify="space-between" className="mb-0">
          <Col flex="1 1 auto" className="mr-2">
            <Search
              defaultValue={conditionSearch.TextSearch}
              placeholder="Ti??u ????? h??? s??, H??? s?? s???, M?? s???, C?? quan l??u tr???"
              enterButton={<SearchOutlined style={{ fontSize: '24px' }} />}
              onSearch={value => handleChangeEasySearch(value)}
            />
          </Col>
          <Tooltip title="" color="#2a2a2a" placement="left">
            <ButtonCustom
              text={!isShowAdvanceSearch ? 'M??? b??? l???c n??ng cao' : '????ng b??? l???c n??ng cao'}
              type="primary"
              size={15}
              color="var(--color-primary)"
              icon={
                <Icon name={!isShowAdvanceSearch ? 'filter_alt' : 'keyboard_arrow_up'} size={20} className="mx-auto" />
              }
              onClick={() => setIsShowAdvanceSearch(!isShowAdvanceSearch)}
            />
          </Tooltip>
        </Row>
      </SearchEasyWrapper>

      {isShowAdvanceSearch && (
        <Form
          className="pd-top-10"
          name="basic"
          form={form}
          layout="vertical"
          initialValues={conditionSearch}
          onValuesChange={(changedValues, allValues) => {
            setIsChangeAdvanceSearch(true)
            handleChange(changedValues, allValues)
          }}
        >
          <FadeIn>
            <Row justify="start" gutter="16">
              <Col span={4}>
                <Form.Item label="Gi??" name="Racking">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {listRacking &&
                      listRacking.length &&
                      listRacking.map(item => (
                        <Option key={Number(item.ID)} value={item.ID}>
                          {item.Description}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Khoang" name="Compartment">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {listCompartment &&
                      listCompartment.length &&
                      listCompartment.map(item => (
                        <Option key={item.ID} value={item.ID}>
                          {item.Description}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="H??ng" name="FileRowNumber">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {listFileRowNumber &&
                      listFileRowNumber.length &&
                      listFileRowNumber.map(item => (
                        <Option key={item.ID} value={item.ID}>
                          {item.Description}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="H???p s???" name="Gear">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value="">T???t c???</Option>
                    {listGear &&
                      listGear.length &&
                      listGear.map(item => (
                        <Option key={item.ID} value={item.Value}>
                          {item.Description}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="QHK" name="NationalAssembly">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {nationalAssembly &&
                      nationalAssembly.length &&
                      nationalAssembly.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="K??? h???p th???" name="CongressMeeting">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {congressMeeting &&
                      congressMeeting.length &&
                      congressMeeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Phi??n h???p" name="Meeting">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {meeting &&
                      meeting.length &&
                      meeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="????? m???t" name="SecurityLevel">
                  <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={null}>T???t c???</Option>
                    {!!securityLevel &&
                      !!securityLevel.length &&
                      securityLevel.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item?.CodeValue)}>
                          {item?.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Th???i gian t???" name="StartDate">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    locale={localeVN}
                    format={dateFormat}
                    inputReadOnly
                    disabledDate={disabledStartDate}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="?????n" name="EndDate">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    locale={localeVN}
                    format={dateFormat}
                    inputReadOnly
                    disabledDate={disabledEndDate}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="Rights" label="Ch??? ????? s??? d???ng">
                  <Select>
                    <Option value={null}>T???t c???</Option>
                    <Option value={1}>H???n ch???</Option>
                    <Option value={2}>Kh??ng h???n ch???</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="FileStatus" label="Tr???ng th??i">
                  <Select>
                    <Option value={null}>T???t c???</Option>
                    <Option value={1}>Ch??? ti???p nh???n</Option>
                    <Option value={2}>Kh??? d???ng</Option>
                    <Option value={3}>??ang khai th??c</Option>
                    <Option value={4}>???? x??a</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </FadeIn>
        </Form>
      )}
    </SystemAdvanceSearchWrapper>
  )
}

SystemAdvanceSearch.propTypes = {
  conditionSearch: PropTypes.object,
  handleChangeEasySearch: PropTypes.func,
  handleChangeAdvanceSearch: PropTypes.func
}

export default SystemAdvanceSearch
