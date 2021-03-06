import React, { useState, useEffect } from 'react'
import { Row, Breadcrumb, Button, Space, Tooltip, Badge, Empty } from 'antd'
import { useToast } from '@chakra-ui/react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// API Service
import FileService from 'src/api/FileService'

// Ultis
import { formatDateVN } from 'src/helpers/FomatDateTime'
import { exportExcelURL } from 'src/helpers'

// Store Redux
import actions from 'src/store/common/actions'

// Components
import ButtonCustom from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import { ModalDeleteReception } from 'src/components/Modals/component/ModalDeleteReception'
import TruncateText from 'src/components/TruncateText'
import { FloatActionWrapper } from 'src/components/FloatAction/styled/FloatActionWrapper'
import SystemAdvanceSearchWrapper from 'src/pages/DataManagement/components/SystemAdvanceSearch'

// Style Component
import {
  DataManagementWrapper,
  BreadcrumbWrapper,
  TableHeadingWrapper,
  TableStyledWrapper
} from 'src/pages/DataManagement/styled/DataManagementWrapper'

const initialSearch = {
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
  FileType: 2,
  PageSize: 20,
  CurrentPage: 1
}
function LookFile() {
  const history = useHistory()
  const toast = useToast()
  const dispatch = useDispatch()

  // State
  const [dataDocument, setDataDocument] = useState([])
  const [fileDetail, setFileDetail] = useState({})
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [paginationData, setPaginationData] = useState({
    CurrentPage: 1,
    PageSize: 20,
    TotalSearch: 0
  })
  const [listFile, setListFile] = useState([])
  const [listReject, setListReject] = useState([])

  // State Modal
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)
  const [isOpenModalDeleteReception, setIsOpenModalDeleteReception] = useState(false)

  // State Modal
  const [isLoading, setIsLoading] = useState(false)

  const columns = [
    {
      title: 'STT',
      align: 'center',
      width: 50,
      key: 'stt',
      render: (value, record, index) => <>{(paginationData?.CurrentPage - 1) * paginationData?.PageSize + index + 1}</>
    },
    {
      title: 'Gi??/Khoang/H??ng',
      dataIndex: 'Racking',
      key: 'Racking',
      width: 100,
      render: (value, record) => (
        <>
          <Tooltip
            title={`Gi?? ${record?.RackingValue}/Khoang ${record?.CompartmentValue}/H??ng ${record?.FileRowNumberValue}`}
            color="#2a2a2a"
          >
            <div>
              {record?.RackingValue || '---'}/{record?.CompartmentValue || '---'}/{record?.FileRowNumberValue || '---'}
            </div>
          </Tooltip>
        </>
      )
    },
    {
      title: 'H???p s???',
      key: 'Gear',
      width: 70,
      dataIndex: 'Gear',
      render: value => (
        <>
          <Tooltip title={`H???p s??? ${value}`} color="#2a2a2a">
            <div>{value}</div>
          </Tooltip>
        </>
      )
    },
    {
      title: 'H??? s?? s???',
      dataIndex: 'FileNo',
      key: 'FileNo',
      width: 70
    },
    {
      title: 'M?? h??? s??',
      dataIndex: 'FileCode',
      width: 70,
      key: 'FileCode',
      render: (value, record) => (
        <TruncateText maxLine={1} content={record?.FileCode} maxWidth="200px">
          {record?.FileCode}
        </TruncateText>
      )
    },
    {
      title: 'Ti??u ?????',
      dataIndex: 'Title',
      key: 'Title',
      className: 'title',
      width: 250,
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth={200}>
          {value}
        </TruncateText>
      )
    },
    {
      title: (
        <>
          <Tooltip title="Th???i gian b???t ?????u - k???t th??c" color="#2a2a2a">
            <div className="title-header">Th???i gian</div>
          </Tooltip>
        </>
      ),
      key: 'StartDate',
      width: 150,
      render: (value, record) => {
        return (
          <>
            <Tooltip
              title={`Th???i gian b???t ?????u:  ${formatDateVN(record.StartDate)} - Th???i gian k???t th??c: ${formatDateVN(
                record.EndDate
              )}`}
              color="#2a2a2a"
            >
              {formatDateVN(record.StartDate)} - {formatDateVN(record.EndDate)}
            </Tooltip>
          </>
        )
      }
    },
    {
      title: (
        <>
          <Tooltip title="S??? l?????ng v??n b???n" color="#2a2a2a">
            <div className="title-header">SLVB</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'TotalDoc',
      key: 'TotalDoc',
      width: 70,
      align: 'center',
      render: value => (
        <>
          <Tooltip title={`S??? l?????ng v??n b???n: ${value}`} color="#2a2a2a">
            {value}
          </Tooltip>
        </>
      )
    },
    {
      title: (
        <>
          <Tooltip title="Ch??? ????? s??? d???ng" color="#2a2a2a">
            <div className="title-header">Ch??? ????? SD</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'Rights',
      key: 'Rights',
      width: 120,
      render: value => {
        return <>{value === 1 ? 'H???n ch???' : value === 2 ? 'Kh??ng h???n ch???' : ''}</>
      }
    },
    {
      title: 'Ghi ch??',
      dataIndex: 'Description',
      key: 'Description',
      width: 250,
      render: value => {
        return (
          <>
            <TruncateText maxLine={1} content={value} maxWidth={250}>
              {value}
            </TruncateText>
          </>
        )
      }
    },
    {
      title: 'Tr???ng th??i',
      dataIndex: 'FileStatus',
      key: 'FileStatus',
      width: 120,
      render: (value, record) => {
        return (
          <>
            <b
              style={
                value === 2
                  ? { color: '#10b981' }
                  : value === 3
                  ? { color: '#ef4444' }
                  : value === 4
                  ? { color: '#ef4444' }
                  : { color: '#333' }
              }
            >
              {record?.FileStatusName}
            </b>
            <FloatActionWrapper size="small" className="float-action__wrapper">
              {record?.FileStatus === 1 && (
                <>
                  <Tooltip title="Ti???p nh???n h??? s??" color="#2a2a2a" mouseLeaveDelay={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={<Icon name="thumb_up" size={20} color="green" className="mx-auto" />}
                      onClick={() => {
                        setFileDetail(record)
                        setListFile([record?.ObjectGuid])
                        setIsOpenModalConfirmReception(true)
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="T??? ch???i ti???p nh???n" color="#2a2a2a" mouseLeaveDelay={0}>
                    <Button
                      type="link"
                      size="small"
                      icon={
                        <Icon name="remove_circle_outline" size={20} color="var(--color-red-500)" className="mx-auto" />
                      }
                      onClick={() => {
                        setFileDetail(record)
                        setListReject([{ ObjectGuid: record?.ObjectGuid, FileNo: record?.FileNo }])
                        setIsOpenModalDenyReception(true)
                      }}
                    />
                  </Tooltip>
                </>
              )}
              {record?.FileStatus !== 4 && (
                <Tooltip title="Xem chi ti???t v?? s???a h??? s??" color="#2a2a2a" mouseLeaveDelay={0}>
                  <Button
                    type="link"
                    size="small"
                    icon={<Icon name="edit" size={20} color="var(--color-blue-600)" className="mx-auto" />}
                    onClick={() => {
                      history.push(`look-file/${record?.ObjectGuid}`)
                    }}
                  />
                </Tooltip>
              )}
              {record?.FileStatus !== 4 && (
                <Tooltip title="Danh s??ch t??i li???u" color="#2a2a2a" mouseLeaveDelay={0}>
                  <Badge count={null} size="small">
                    <Button
                      type="link"
                      size="small"
                      icon={<Icon name="list" size={20} color="green" className="mx-auto" />}
                      onClick={() => history.push(`/look-file/${record.ObjectGuid}/paper`)}
                    />
                  </Badge>
                </Tooltip>
              )}
              <Tooltip title="Xem l???ch s???" color="#2a2a2a" mouseLeaveDelay={0}>
                <Button
                  type="link"
                  size="small"
                  icon={<Icon name="history" size={20} color="green" className="mx-auto" />}
                  onClick={() => {
                    dispatch(actions.setObjectGuidHistory(record?.ObjectGuid))
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

  const getListLookFile = body => {
    setConditionSearch(body)
    setIsLoading(true)
    FileService.getListAdvancedSearchFile(body)
      .then(res => {
        if (res.isError) return
        const newData = res.Object?.Data.map((item, idx) => {
          return {
            ...item,
            key: idx
          }
        })
        setDataDocument(newData)
        setPaginationData({
          CurrentPage: res?.Object?.CurrentPage,
          PageSize: res?.Object?.PageSize,
          TotalSearch: res?.Object?.TotalSearch
        })
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangePage = (page, pageSize) => {
    getListLookFile({
      ...conditionSearch,
      PageSize: pageSize,
      CurrentPage: page
    })
  }

  const rowSelection = {
    type: 'checkbox',
    onChange: (selectedRowKeys, selectedRows) => {
      const newList = selectedRows?.map(item => {
        return {
          ObjectGuid: item?.ObjectGuid,
          FileNo: item?.FileNo
        }
      })
      setListReject(newList)
      setListFile([...selectedRowKeys])
    },
    getCheckboxProps: record => ({
      disabled: record.FileStatus !== 1
    }),
    selectedRowKeys: listFile
  }

  const onReceiveFile = () => {
    setIsLoading(true)
    FileService.receive({
      ObjectGuildList: listFile
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???????c l??u kho',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setListFile([])
        setListReject([])
        setFileDetail({})
        setIsOpenModalConfirmReception(false)
        getListLookFile(conditionSearch)
      })
      .finally(() => setIsLoading(false))
  }

  const onRejectFile = reason => {
    setIsLoading(true)
    FileService.rejectList({
      Content: reason.Content,
      ListObjectGuidFileSync: listReject
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???? b??? t??? ch???i',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setFileDetail({})
        setListFile([])
        setListReject([])
        setIsOpenModalDenyReception(false)
        getListLookFile(conditionSearch)
      })
      .finally(() => setIsLoading(false))
  }

  const checkListReceiveReject = (receive = true) => {
    if (!listFile.length) {
      toast({
        title: `${
          receive ? 'B???n ch??a ch???n danh s??ch h??? s?? c???n ti???p nh???n!' : 'B???n ch??a ch???n danh s??ch h??? s?? c???n t??? ch???i!'
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

  const exportFile = () => {
    setIsLoading(true)
    FileService.export({
      ...conditionSearch,
      PageSize: paginationData.TotalSearch,
      CurrentPage: 1
    })
      .then(res => {
        if (!res.isError) {
          exportExcelURL(res.Object)
          // window.open(`${process.env.REACT_APP_DOMAIN}${res.Object}`)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangeEasySearch = value => {
    getListLookFile({ ...conditionSearch, TextSearch: value })
  }

  const handleChangeAdvanceSearch = allValues => {
    getListLookFile({ ...conditionSearch, ...allValues })
  }

  useEffect(() => {
    return () => dispatch(actions.setCloseModalDataMining())
  }, [])

  useEffect(() => {
    getListLookFile(conditionSearch)
  }, [])

  return (
    <DataManagementWrapper>
      <BreadcrumbWrapper>
        <Breadcrumb.Item>Qu???n l?? d??? li???u</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/look-file">Danh s??ch h??? s??</Link>
        </Breadcrumb.Item>
      </BreadcrumbWrapper>
      <Row justify="start" className="mb-10">
        <SystemAdvanceSearchWrapper
          conditionSearch={conditionSearch}
          handleChangeEasySearch={handleChangeEasySearch}
          handleChangeAdvanceSearch={handleChangeAdvanceSearch}
        />
      </Row>
      <TableHeadingWrapper>
        <div>
          <div className="table-heading">Danh s??ch h??? s?? nh??n</div>
          <div>S??? b???n ghi: {paginationData.TotalSearch} </div>
        </div>
        <Space>
          <ButtonCustom
            text="Th??m h??? s??"
            color="var(--color-primary)"
            icon={<Icon name="add" size={20} className="mx-auto" />}
            size={15}
            onClick={() => history.push(`/look-file/2/create`)}
          />
          <ButtonCustom
            text="Ti???p nh???n"
            color="var(--color-primary)"
            icon={<Icon name="thumb_up" size={20} className="mx-auto" />}
            size={15}
            onClick={() => {
              checkListReceiveReject(true)
            }}
          />
          <ButtonCustom
            text="T??? ch???i"
            color="var(--color-red-500)"
            icon={<Icon name="remove_circle_outline" size={20} className="mx-auto" />}
            size={15}
            onClick={() => {
              checkListReceiveReject(false)
            }}
          />
          <ButtonCustom
            text="Xu???t file"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => {
              exportFile()
            }}
          />
        </Space>
      </TableHeadingWrapper>

      <TableStyledWrapper
        loading={isLoading}
        rowSelection={{
          ...rowSelection
        }}
        columns={columns}
        dataSource={dataDocument}
        key={columns.key}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Kh??ng t??m th???y d??? li???u" />
        }}
        pagination={
          paginationData.TotalSearch > 10 && {
            pageSize: paginationData.PageSize,
            current: paginationData.CurrentPage,
            total: paginationData.TotalSearch,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            locale: { items_per_page: '' },
            onChange: (page, pageSize) => handleChangePage(page, pageSize)
          }
        }
        rowClassName={record =>
          record?.FileStatus === 1 ? 'row-inactive' : record?.FileStatus === 4 ? 'row-delete' : ''
        }
        ellipsis
      />

      <ModalDenyReception
        visible={isOpenModalDenyReception}
        type="primary"
        onOk={onRejectFile}
        onCancel={() => setIsOpenModalDenyReception(false)}
      />

      <ModalConfirmReception
        visible={isOpenModalConfirmReception}
        type="primary"
        data={fileDetail}
        onOk={() => onReceiveFile()}
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

LookFile.propTypes = {}

export default LookFile
