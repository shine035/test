import React, { useState, useEffect } from 'react'
import { Row, Button, Space, Tooltip, Empty } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// API Service
import GalleryService from 'src/api/GalleryService'

// UI
import { formatDateVN } from 'src/helpers/FomatDateTime'
import { exportExcelURL } from 'src/helpers'
import { getActiveLinkByPathName } from 'src/helpers/string'

// Component
import Icon from 'src/components/Icon/Icon'
import { ModalDeleteReception } from 'src/components/Modals/component/ModalDeleteReception'
import ButtonCustom from 'src/components/Button/Button'
import TruncateText from 'src/components/TruncateText'
import { FloatActionWrapper } from 'src/components/FloatAction/styled/FloatActionWrapper'

// Store redux
import actions from 'src/store/common/actions'

// Styled Component
import GallerySystemAdvanceSearch from './GallerySystemAdvanceSearch'
import { DataManagementWrapper, TableHeadingWrapper, TableStyledWrapper } from '../styled/DataManagementWrapper'

const initialSearch = {
  TextSearch: '',
  ObjectGuidFile: '',
  NationalAssembly: null,
  CongressMeeting: null,
  Meeting: null,
  StartDate: null,
  EndDate: null,
  GalleryStatus: null,
  PageSize: 20,
  CurrentPage: 1
}
function Gallery() {
  const history = useHistory()
  const dispatch = useDispatch()
  const { FileObjectGuid } = useParams()
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [isOpenModalDeleteReception, setIsOpenModalDeleteReception] = useState(false)
  const [paginationData, setPaginationData] = useState({
    CurrentPage: 1,
    PageSize: 20,
    TotalSearch: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dataGallery, setDataGallery] = useState([])
  const [fileLink, setFileLink] = useState({})

  const columnssta = [
    {
      title: 'STT',
      align: 'center',
      width: 50,
      render: (value, record, index) => <>{(paginationData?.CurrentPage - 1) * paginationData?.PageSize + index + 1}</>
    },
    {
      title: (
        <>
          <Tooltip title="M?? ????n v??? b???o qu???n s??u t???p ???nh" color="#2a2a2a">
            <div className="title-header">M?? ??VBQ/STA</div>
          </Tooltip>
        </>
      ),
      width: 120,
      dataIndex: 'OrganizationCollectCode'
    },
    {
      title: (
        <>
          <Tooltip placement="topLeft" title="N???i dung s??u t???p ???nh" color="#2a2a2a">
            <div className="title-header">N???i dung STA</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'GalleryContent',
      className: 'title',
      width: 300,
      render: value => {
        return (
          <>
            <TruncateText maxLine={1} content={value} maxWidth={300}>
              {value}
            </TruncateText>
          </>
        )
      }
    },
    {
      title: (
        <>
          <Tooltip title="Th???i gian b???t ?????u - k???t th??c" color="#2a2a2a">
            <div className="title-header">Th???i gian</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'IssuedDate',
      width: 180,
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
          <div className="title-header">S??? l?????ng phim, ??m b???n</div>
        </>
      ),
      width: 200,
      dataIndex: 'NegativeNo'
    },
    {
      title: (
        <>
          <div className="title-header">S??? l?????ng phim, d????ng b???n</div>
        </>
      ),
      width: 200,
      dataIndex: 'PositiveNo'
    },
    {
      title: 'Ghi ch??',
      dataIndex: 'Description',
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
      dataIndex: 'GalleryStatus',
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
              {record.GalleryStatusName}
            </b>
            <FloatActionWrapper size="small" className="float-action__wrapper">
              {record.GalleryStatus === 2 && (
                <Tooltip title="S???a, Xem chi ti???t" color="#2a2a2a">
                  <Button
                    type="link"
                    size="small"
                    icon={<Icon name="edit" size={20} color="var(--color-blue-600)" className="mx-auto" />}
                    onClick={() => {
                      history.push(`${fileLink.url}/${FileObjectGuid}/gallery/${record.ObjectGuid}`)
                    }}
                  />
                </Tooltip>
              )}

              {record.GalleryStatus !== 4 && (
                <Tooltip title="Danh s??ch ???nh" color="#2a2a2a">
                  <Button
                    type="link"
                    size="small"
                    icon={<Icon name="list" size={20} color="green" className="mx-auto" />}
                    onClick={() => history.push(`${fileLink.url}/${FileObjectGuid}/gallery/${record.ObjectGuid}/photo`)}
                  />
                </Tooltip>
              )}
              <Tooltip title="Xem l???ch s???" color="#2a2a2a">
                <Button
                  type="link"
                  size="small"
                  icon={<Icon name="history" size={20} color="green" className="mx-auto" />}
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

  useEffect(() => {
    return () => dispatch(actions.setCloseModalDataMining())
  }, [])

  useEffect(() => {
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    getListGallery({ ...conditionSearch, ObjectGuidFile: FileObjectGuid })
  }, [])

  const getListGallery = body => {
    setConditionSearch(body)
    setIsLoading(true)
    GalleryService.getListAdvancedSearch(body)
      .then(res => {
        if (res?.isError) return
        setDataGallery(res.Object?.Data)
        setPaginationData({
          CurrentPage: res.Object.CurrentPage,
          PageSize: res.Object.PageSize,
          TotalSearch: res.Object.TotalSearch
        })
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangePage = (page, pageSize) => {
    const body = {
      ...conditionSearch,
      ObjectGuidFile: FileObjectGuid,
      PageSize: pageSize,
      CurrentPage: page
    }
    getListGallery(body)
  }

  const exportGallery = () => {
    GalleryService.export({ ...conditionSearch, ObjectGuidFile: FileObjectGuid }).then(res => {
      if (!res.isError) {
        exportExcelURL(res.Object)
      }
    })
  }

  const handleChangeEasySearch = value => {
    getListGallery({ ...conditionSearch, TextSearch: value, ObjectGuidFile: FileObjectGuid })
  }

  const handleChangeAdvanceSearch = allValues => {
    getListGallery({ ...conditionSearch, ...allValues, ObjectGuidFile: FileObjectGuid })
  }
  return (
    <DataManagementWrapper>
      <Row justify="start" className="mb-0">
        <GallerySystemAdvanceSearch
          conditionSearch={conditionSearch}
          handleChangeEasySearch={handleChangeEasySearch}
          handleChangeAdvanceSearch={handleChangeAdvanceSearch}
        />
      </Row>
      <TableHeadingWrapper>
        <div>
          <div className="table-heading">Danh s??ch s??u t???p ???nh</div>
          <div>S??? b???n ghi: {paginationData.TotalSearch} </div>
        </div>
        <Space>
          <ButtonCustom
            text="Th??m s??u t???p"
            color="var(--color-primary)"
            icon={<Icon name="add" size={20} className="mx-auto" />}
            size={15}
            onClick={() => history.push('gallery/create')}
          />
          <ButtonCustom
            text="Xu???t file"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => exportGallery()}
          />
        </Space>
      </TableHeadingWrapper>

      <TableStyledWrapper
        loading={isLoading}
        columns={columnssta}
        dataSource={dataGallery}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Kh??ng t??m th???y d??? li???u" />
        }}
        pagination={{
          pageSize: paginationData.PageSize,
          current: paginationData.CurrentPage,
          total: paginationData.TotalSearch,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          locale: { items_per_page: '' },
          onChange: (page, pageSize) => handleChangePage(page, pageSize)
        }}
        rowClassName={record =>
          record?.GalleryStatus === 1 ? 'row-inactive' : record?.GalleryStatus === 4 ? 'row-delete' : ''
        }
        ellipsis
      />

      <ModalDeleteReception
        visible={isOpenModalDeleteReception}
        type="primary"
        onCancel={() => setIsOpenModalDeleteReception(false)}
      />
    </DataManagementWrapper>
  )
}

Gallery.propTypes = {}

export default Gallery
