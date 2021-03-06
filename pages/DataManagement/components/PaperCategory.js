import React, { useState, useEffect } from 'react'
import { Row, Button, Space, Tooltip, Empty } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

// Component
import ButtonCustom from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'
import { ModalDeleteReception } from 'src/components/Modals/component/ModalDeleteReception'
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import TruncateText from 'src/components/TruncateText'
import { FloatActionWrapper } from 'src/components/FloatAction/styled/FloatActionWrapper'

// API Service
import DocumentService from 'src/api/DocumentService'

// Ultis
import { formatDateVN } from 'src/helpers/FomatDateTime'
import { exportExcelURL } from 'src/helpers'

// Store Redux
import actions from 'src/store/common/actions'

// Styled Component
import PaperSystemAdvanceSearch from './PaperSystemAdvanceSearch'
import { DataManagementWrapper, TableHeadingWrapper, TableStyledWrapper } from '../styled/DataManagementWrapper'

const initialSearch = {
  TextSearch: '',
  ObjectGuidFile: '',
  NationalAssembly: 0,
  CongressMeeting: 0,
  Meeting: 0,
  TypeName: '',
  SecurityLevel: 0,
  Mode: 0,
  IssuedDateFrom: '',
  IssuedDateTo: '',
  DocStatus: 0,
  PageSize: 20,
  CurrentPage: 1
}
const PaperCategory = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { FileObjectGuid } = useParams()
  const toast = useToast()

  // State
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [dataDocument, setDataDocument] = useState([])
  const [documentDetail, setDocumentDetail] = useState({})
  const [paginationData, setPaginationData] = useState({})
  const [listDocument, setListDocument] = useState([])
  const [listReject, setListDocumentReject] = useState([])

  // State Modal
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDeleteReception, setIsOpenModalDeleteReception] = useState(false)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  const columns = [
    {
      title: 'STT',
      align: 'center',
      width: 50,
      render: (value, record, index) => <>{(paginationData?.CurrentPage - 1) * paginationData?.PageSize + index + 1}</>
    },
    {
      title: 'S??? k?? hi???u',
      dataIndex: 'FileNotation'
    },
    {
      title: 'Ng??y v??n b???n',
      dataIndex: 'IssuedDate',
      align: 'center',
      render: value => <>{formatDateVN(value)}</>
    },
    {
      title: 'Tr??ch y???u n???i dung',
      dataIndex: 'Subject',
      width: '30%',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth="100%">
          {value}
        </TruncateText>
      )
    },
    {
      title: 'S??? t???',
      align: 'center',
      width: 100,
      dataIndex: 'PiecesOfPaper'
    },
    {
      title: 'Ch??? ????? s??? d???ng',
      width: '7%',
      dataIndex: 'Mode',
      render: value => {
        return <>{value === 1 ? 'H???n ch???' : value === 2 ? 'Kh??ng h???n ch???' : ''}</>
      }
    },
    {
      title: 'Ghi ch??',
      dataIndex: 'Description',
      width: '25%',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth="100%">
          {value}
        </TruncateText>
      )
    },
    {
      title: 'Tr???ng th??i',
      dataIndex: 'DocStatus',
      width: 150,
      render: (value, record) => {
        return (
          <>
            <b
              style={
                value === 2
                  ? { color: '#10b981' }
                  : value === 1
                  ? { color: '#2196f3' }
                  : value === 3
                  ? { color: '#ef4444' }
                  : value === 4
                  ? { color: '#ef4444' }
                  : { color: '#333' }
              }
            >
              {record.DocStatusName}
            </b>
            <FloatActionWrapper size="small" className="float-action__wrapper">
              {record.DocStatus === 1 && (
                <>
                  <Tooltip title="Ti???p nh???n t??i li???u" color="#2a2a2a">
                    <Button
                      type="link"
                      size="small"
                      icon={<Icon name="thumb_up" size={20} color="var(--color-primary)" className="mx-auto" />}
                      onClick={() => {
                        setDocumentDetail(record)
                        setListDocument([record.ObjectGuid])
                        setIsOpenModalConfirmReception(true)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="T??? ch???i" color="#2a2a2a">
                    <Button
                      type="link"
                      size="small"
                      icon={
                        <Icon name="remove_circle_outline" size={20} color="var(--color-red-500)" className="mx-auto" />
                      }
                      onClick={() => {
                        setDocumentDetail(record)
                        setIsOpenModalDenyReception(true)
                      }}
                    />
                  </Tooltip>
                </>
              )}
              {record.DocStatus !== 4 && (
                <Tooltip title="S???a, Xem chi ti???t" color="#2a2a2a">
                  <Button
                    type="link"
                    size="small"
                    icon={<Icon name="edit" size={20} color="var(--color-blue-600)" className="mx-auto" />}
                    onClick={() => {
                      history.push(`paper/${record.ObjectGuid}`)
                    }}
                  />
                </Tooltip>
              )}
              <Tooltip title="L???ch s???" color="#2a2a2a">
                <Button
                  type="link"
                  size="small"
                  icon={<Icon name="history" size={20} color="var(--color-primary)" className="mx-auto" />}
                  onClick={() => {
                    dispatch(actions.setObjectGuidHistory(record.ObjectGuid))
                    dispatch(actions.setOpenModalHistory())
                  }}
                />
              </Tooltip>
            </FloatActionWrapper>
          </>
        )
      }
    }
  ]

  const getListPaperDocument = newConditionSearch => {
    setIsLoading(true)
    setConditionSearch(newConditionSearch)
    DocumentService.getListAdvancedSearch(newConditionSearch)
      .then(res => {
        if (!res.isError && !res.Status) {
          const list = res.Object?.Data?.map(item => {
            return {
              ...item,
              key: item.ObjectGuid
            }
          })
          setDataDocument(list)
          setPaginationData({
            CurrentPage: res.Object?.CurrentPage,
            PageSize: res.Object?.PageSize,
            TotalSearch: res.Object?.TotalSearch
          })
        }
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangeEasySearch = value => {
    const newConditionSearch = {
      ...conditionSearch,
      ObjectGuidFile: FileObjectGuid,
      CurrentPage: 1,
      TextSearch: value
    }
    getListPaperDocument(newConditionSearch)
  }

  const handleChangeAdvanceSearch = allValues => {
    const newConditionSearch = {
      ...conditionSearch,
      ...allValues,
      ObjectGuidFile: FileObjectGuid,
      CurrentPage: 1,
      IssuedDateFrom: allValues.IssuedDateFrom ? moment(allValues.IssuedDateFrom).format() : '',
      IssuedDateTo: allValues.IssuedDateTo ? moment(allValues.IssuedDateTo).format() : ''
    }
    getListPaperDocument(newConditionSearch)
  }

  const handleChangePage = (page, pageSize) => {
    const newConditionSearch = {
      ...conditionSearch,
      PageSize: pageSize,
      CurrentPage: page
    }
    getListPaperDocument(newConditionSearch)
  }

  const exportPaperDocument = () => {
    DocumentService.export(conditionSearch).then(res => {
      if (!res.isError) {
        exportExcelURL(res.Object)
      }
    })
  }

  const onReceivePaperDocument = () => {
    const body = {
      FileObjectGuid,
      ListObjectGuidDocSync: listDocument
    }
    DocumentService.receive(body).then(res => {
      if (res.isError) return
      toast({
        title: `T??i li???u ???????c l??u kho`,
        status: 'success',
        position: 'bottom-right',
        duration: 2000,
        isClosable: true
      })
      setListDocument([])
      setListDocumentReject([])
      setDocumentDetail({})
      getListPaperDocument(conditionSearch)
    })
    setIsOpenModalConfirmReception(false)
  }

  const onRejectPaperDocument = reason => {
    const body = {
      Content: reason.Content,
      ListObjectGuidDocSync: listReject
    }
    DocumentService.reject(body).then(res => {
      if (res.isError) return
      toast({
        title: `T??i li???u ???? b??? t??? ch???i`,
        status: 'success',
        position: 'bottom-right',
        duration: 2000,
        isClosable: true
      })
      setListDocument([])
      setListDocumentReject([])
      setDocumentDetail({})
      getListPaperDocument(conditionSearch)
    })
    setIsOpenModalDenyReception(false)
  }

  const checkListReceiveReject = (receive = true) => {
    if (!listDocument.length) {
      toast({
        title: `${
          receive ? 'B???n ch??a ch???n danh s??ch t??i li???u c???n ti???p nh???n!' : 'B???n ch??a ch???n danh s??ch t??i li???u c???n t??? ch???i!'
        }`,
        status: 'warning',
        position: 'bottom-right',
        duration: 2000,
        isClosable: true
      })
    } else if (receive) {
      setIsOpenModalConfirmReception(true)
    } else setIsOpenModalDenyReception(true)
  }

  const rowSelection = {
    type: 'checkbox',
    onChange: (selectedRowKeys, selectedRows) => {
      const newList = selectedRows?.map(item => {
        return {
          ObjectGuid: item?.ObjectGuid,
          FileNotation: item?.FileNotation
        }
      })
      setListDocumentReject(newList)
      setListDocument([...selectedRowKeys])
    },
    getCheckboxProps: record => ({
      disabled: record.DocStatus !== 1
    })
  }

  useEffect(() => {
    return () => dispatch(actions.setCloseModalDataMining())
  }, [])

  useEffect(() => {
    const newConditionSearch = {
      ...conditionSearch,
      ObjectGuidFile: FileObjectGuid
    }
    getListPaperDocument(newConditionSearch)
  }, [])

  return (
    <DataManagementWrapper>
      <Row justify="start" className="mb-0">
        <PaperSystemAdvanceSearch
          conditionSearch={conditionSearch}
          handleChangeEasySearch={handleChangeEasySearch}
          handleChangeAdvanceSearch={handleChangeAdvanceSearch}
        />
      </Row>
      <TableHeadingWrapper>
        <div>
          <div className="table-heading">Danh s??ch t??i li???u gi???y</div>
          <div>S??? b???n ghi: {paginationData.TotalSearch} </div>
        </div>
        <Space>
          <ButtonCustom
            text="Th??m t??i li???u"
            color="var(--color-primary)"
            icon={<Icon name="add" size={20} className="mx-auto" />}
            size={15}
            onClick={() => history.push('paper/create')}
          />
          <ButtonCustom
            text="Ti???p nh???n"
            color="var(--color-primary)"
            icon={<Icon name="thumb_up" size={20} className="mx-auto" />}
            size={15}
            onClick={() => checkListReceiveReject(true)}
          />
          <ButtonCustom
            text="T??? ch???i"
            color="var(--color-red-500)"
            icon={<Icon name="remove_circle_outline" size={20} className="mx-auto" />}
            size={15}
            onClick={() => checkListReceiveReject(false)}
          />
          <ButtonCustom
            text="Xu???t file"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => exportPaperDocument()}
          />
        </Space>
      </TableHeadingWrapper>

      <TableStyledWrapper
        loading={isLoading}
        rowSelection={{ ...rowSelection }}
        columns={columns}
        dataSource={dataDocument}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Kh??ng t??m th???y d??? li???u" />
        }}
        pagination={
          paginationData?.TotalSearch > 10 && {
            pageSize: paginationData?.PageSize,
            current: paginationData?.CurrentPage,
            total: paginationData?.TotalSearch,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            locale: { items_per_page: '' },
            onChange: (page, pageSize) => handleChangePage(page, pageSize)
          }
        }
        rowClassName={record =>
          record?.DocStatus === 1 ? 'row-inactive' : record?.DocStatus === 4 ? 'row-delete' : ''
        }
        ellipsis
      />

      {/* modal */}
      <ModalDenyReception
        visible={isOpenModalDenyReception}
        type="primary"
        onOk={onRejectPaperDocument}
        onCancel={() => setIsOpenModalDenyReception(false)}
      />
      <ModalConfirmReception
        visible={isOpenModalConfirmReception}
        type="primary"
        data={documentDetail}
        onOk={() => onReceivePaperDocument()}
        onCancel={() => setIsOpenModalConfirmReception(false)}
      />
      <ModalDeleteReception
        visible={isOpenModalDeleteReception}
        type="primary"
        onCancel={() => setIsOpenModalDeleteReception(false)}
      />
    </DataManagementWrapper>
  )
}

PaperCategory.propTypes = {}

export default PaperCategory
