import React, { useState, useEffect } from 'react'
import { Row, Button, Space, Tooltip, Empty } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import moment from 'moment'

// API Service
import FilmService from 'src/api/FilmService'

// Helpers
import { formatDateVN } from 'src/helpers/FomatDateTime'
import { exportExcelURL } from 'src/helpers'

// Component
import Icon from 'src/components/Icon/Icon'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import { ModalDeleteReception } from 'src/components/Modals/component/ModalDeleteReception'
import ButtonCustom from 'src/components/Button/Button'
import TruncateText from 'src/components/TruncateText'
import { FloatActionWrapper } from 'src/components/FloatAction/styled/FloatActionWrapper'

// Store redux
import actions from 'src/store/common/actions'

// Styled Component
import FilmSystemAdvanceSearch from './FilmSystemAdvanceSearch'
import { DataManagementWrapper, TableHeadingWrapper, TableStyledWrapper } from '../styled/DataManagementWrapper'

const initialSearch = {
  TextSearch: '',
  ObjectGuidFile: '',
  NationalAssembly: 0,
  CongressMeeting: 0,
  Meeting: 0,
  RecordDateFrom: '',
  RecordDateTo: '',
  Mode: 0,
  FilmStatus: 0,
  PageSize: 20,
  CurrentPage: 1
}

function FilmCategory() {
  const history = useHistory()
  const dispatch = useDispatch()
  const { FileObjectGuid } = useParams()

  // State
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [dataFilm, setDataFilm] = useState([])
  const [paginationData, setPaginationData] = useState({})

  // State Modal
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDeleteReception, setIsOpenModalDeleteReception] = useState(false)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (value, record, index) => <>{(paginationData.CurrentPage - 1) * paginationData.PageSize + index + 1}</>
    },
    {
      title: 'T??n s??? ki???n',
      dataIndex: 'EventName',
      width: '15%',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth={200}>
          {value}
        </TruncateText>
      )
    },
    {
      title: 'K?? hi???u th??ng tin',
      width: 150,
      dataIndex: 'InforSign',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth={150}>
          {value}
        </TruncateText>
      )
    },
    {
      title: 'S??? l??u tr???',
      width: 150,
      dataIndex: 'ArchivesNumber',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth={150}>
          {value}
        </TruncateText>
      )
    },
    {
      title: 'Ti??u ?????',
      dataIndex: 'MovieTitle',
      width: '15%',
      render: value => (
        <TruncateText maxLine={2} content={value} maxWidth={250}>
          {value}
        </TruncateText>
      )
    },
    {
      title: 'T??c gi???',
      dataIndex: 'Recorder',
      width: 200
    },
    {
      title: 'Th???i gian',
      width: 150,
      align: 'center',
      dataIndex: 'RecordDate',
      render: value => {
        return (
          <div>
            <p>{formatDateVN(value)}</p>
          </div>
        )
      }
    },
    {
      title: 'Ch??? ????? s??? d???ng',
      width: 150,
      dataIndex: 'Mode',
      render: value => {
        return <>{value === 1 ? 'H???n ch???' : value === 2 ? 'Kh??ng h???n ch???' : ''}</>
      }
    },
    {
      title: 'Ghi ch??',
      dataIndex: 'Description',
      width: '15%',
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
      dataIndex: 'FilmStatus',
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
              {record.FilmStatusName}
            </b>
            <FloatActionWrapper size="small" className="float-action__wrapper">
              {record.FilmStatus !== 4 && (
                <Tooltip title="S???a, Xem chi ti???t" color="#2a2a2a">
                  <Button
                    type="link"
                    size="small"
                    icon={
                      <Icon
                        name="edit"
                        size={20}
                        color="var(--color-blue-600)"
                        className="mx-auto"
                        onClick={() => history.push(`film/${record.ObjectGuid}`)}
                      />
                    }
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

  const getListFilmDocument = newConditionSearch => {
    setIsLoading(true)
    setConditionSearch(newConditionSearch)

    FilmService.getListAdvancedSearch(newConditionSearch)
      .then(res => {
        if (!res.isError && !res.Status) {
          setDataFilm(res.Object?.Data)
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
    getListFilmDocument(newConditionSearch)
  }

  const handleChangeAdvanceSearch = allValues => {
    const newConditionSearch = {
      ...conditionSearch,
      ...allValues,
      ObjectGuidFile: FileObjectGuid,
      CurrentPage: 1,
      RecordDateFrom: allValues.RecordDateFrom ? moment(allValues.RecordDateFrom).format() : '',
      RecordDateTo: allValues.RecordDateTo ? moment(allValues.RecordDateTo).format() : ''
    }
    getListFilmDocument(newConditionSearch)
  }

  const handleChangePage = (page, pageSize) => {
    const newConditionSearch = {
      ...conditionSearch,
      PageSize: pageSize,
      CurrentPage: page
    }
    getListFilmDocument(newConditionSearch)
  }

  const exportFilmDocument = () => {
    FilmService.export(conditionSearch).then(res => {
      if (!res.isError) {
        exportExcelURL(res.Object)
      }
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
    getListFilmDocument(newConditionSearch)
  }, [])

  return (
    <DataManagementWrapper>
      <Row justify="start" className="mb-0">
        <FilmSystemAdvanceSearch
          conditionSearch={conditionSearch}
          handleChangeEasySearch={handleChangeEasySearch}
          handleChangeAdvanceSearch={handleChangeAdvanceSearch}
        />
      </Row>
      <TableHeadingWrapper>
        <div>
          <div className="table-heading">Danh s??ch T??i Li???u Phim ???nh, ??m thanh</div>
          <div>S??? b???n ghi: {paginationData.TotalSearch} </div>
        </div>
        <Space>
          <ButtonCustom
            text="Th??m t??i li???u"
            color="var(--color-primary)"
            icon={<Icon name="add" size={20} className="mx-auto" />}
            size={15}
            onClick={() => history.push('film/create')}
          />
          <ButtonCustom
            text="Xu???t file"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => exportFilmDocument()}
          />
        </Space>
      </TableHeadingWrapper>

      <TableStyledWrapper
        loading={isLoading}
        columns={columns}
        dataSource={dataFilm}
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
          record?.FilmStatus === 1 ? 'row-inactive' : record?.FilmStatus === 4 ? 'row-delete' : ''
        }
        ellipsis
      />

      {/* modal */}
      <ModalDenyReception
        visible={isOpenModalDenyReception}
        type="primary"
        onCancel={() => setIsOpenModalDenyReception(false)}
      />
      <ModalConfirmReception
        visible={isOpenModalConfirmReception}
        type="primary"
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

FilmCategory.propTypes = {}

export default FilmCategory
