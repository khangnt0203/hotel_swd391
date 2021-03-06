import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Breadcrumb,
  Layout,
  Modal,
  Select,
  Form,
  message,
  Table,
  Popconfirm,
  InputNumber,
} from "antd";
import "antd/dist/antd.css";
import "../ServiceDetail/style.css";

import FormControl from "@mui/material/FormControl";

import { delAuth, getAuth, postAuth, putAuth } from "../../../Util/httpHelper";
import { getHotel, getToken } from "../../../Util/Auth";
import {
  DeleteFilled,
  EditFilled,
  PlusSquareOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function onChange(pagination, filters, sorter, extra) {
  console.log("params", pagination, filters, sorter, extra);
}
function ServiceTable() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalUpdateVisible, setIsModalUpdateVisible] = useState(false);
  const [cateList, setCateList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [keyword, setKeyword] = useState([]);
  const [keyCate, setKeyCate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceName, setServiceName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();
  const [cate, setCate] = useState();
  const [serviceID, setServiceID] = useState();
  const [selectedService, setSelectedService] = useState();
  const [formAdd] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsModalUpdateVisible(false);
  };

  function handleInputChange(e) {
    setKeyword(e.target.value);
  }
  useEffect(() => {
    getListCate();
    getListServiceByCate(keyCate);
  }, []);
  useEffect(() => {
    if (selectedService) {
      formUpdate.setFieldsValue({
        nameService: selectedService.nameService,
        description: selectedService.description,
        price: selectedService.price,
        serviceCategoryId: selectedService.serviceCategoryId
      });
    }
  }, [selectedService]);
  async function handleInputChange(e) {
    setKeyword(e.target.value);
  }
  //delete
  const deleteService = (id) => {
    delAuth(`/services/${id}`).then((response) => {
      if (response.status === 200) {
        message.success("Delete Successfully");
        getListServiceByCate(cate);
      }
    });
  };
  let chosen = getHotel();

  function getListCate() {
    getAuth(`/service-categories?hotel-id=${chosen}`).then((response) => {
      let map = new Map();
      if (response.status === 200) {
        response.data.data.map((e) => {
          map.set(e.id, e);
        });
        setCateList([...map.values()]);
      }
    });
  }

  async function getListServiceByCate(e) {
    let map = new Map();
    getAuth(`/services?service-category-id=${e}`).then((response) => {
      if (response.status === 200) {
        response.data.data.data.map((p) => {
          map.set(p.id, p);
        });
        setServiceList([...map.values()]);
      }
    });
  }

  async function loadCate(e) {
    await setCate(e);
    console.log(cate);
  }
  function getListServiceBySearch() {
    getAuth(`/services?name=${keyword}&service-category-id=${keyCate}`).then(
      (response) => {
        if (response.status === 200) {
          setServiceList([...response.data.data.data]);
        }
      }
    );
  }
  const column = [
    {
      title: "No",
      key: "nameService",
      render: (e, item, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Service name",
      key: "nameService",
      dataIndex: "nameService",
    },
    {
      title: "Description",
      key: "nameCatService",
      dataIndex: "description",
    },
    {
      title: "price",
      key: "nameCatService",
      dataIndex: "price",
    },
    {
      title: "Action",
      render: (e, item) => {
        return (
          <>
            <Button
              type="primary"
              style={{
                borderRadius: 3,
                marginLeft: 10,
                height: 45,
                boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#11cdef",
                borderColor: "#11cdef",
              }}
              onClick={() => {
                setServiceID(item.id);
                setSelectedService(item);
                setIsModalUpdateVisible(true);
              }}
            >
              <EditFilled />
            </Button>
            <Popconfirm
              title="Are you sure to delete this Service?"
              onConfirm={() => {
                deleteService(item.id);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="danger"
                style={{
                  borderRadius: 3,
                  height: 45,
                  marginLeft: 10,
                  boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f5365c",
                }}
              >
                <DeleteFilled />
              </Button>
            </Popconfirm>
            ,
          </>
        );
      },
    },
  ];
  //add service
  const addService = () => {
    console.log("service name:", serviceName);
    console.log("price:", price);
    console.log("cate:", cate);
    postAuth(`/services`, {
      nameService: serviceName,
      price: price,
      serviceCategoryId: cate,
      description: description,
    }).then((response) => {
      if (response.status === 201) {
        message.success("Input Successfully");
        setIsModalVisible(false);
        getListServiceByCate(cate);
        formAdd.resetFields();
      }
    });
  };
  //edit category
  const editService = (values) => {
    putAuth(`/services`, {
      id: serviceID,
      nameService: values.nameService,
      description: values.description,
      price: values.price,
      serviceCategoryId: values.serviceCategoryId,
      status: true
    }).then((response) => {
      if (response.status === 200) {
        message.success("Update Successfully");
        setIsModalUpdateVisible(false);
        getListServiceByCate(cate);
      }
    });
  };
  return (
    <div>
      <Modal
        title="Service Category Form"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
      >
        <Form
          name="basic"
          form={formAdd}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 40,
          }}
          autoComplete="off"
        >
          <div>Name Service</div>
          <Form.Item
            name="nameService"
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input
              placeholder="Name Service"
              name="nameService"
              style={{
                height: 50,

                borderRadius: 6,
              }}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </Form.Item>
          <div>Price</div>
          <Form.Item
            name="Price"
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Price"
              name="price"
              style={{
                height: 50,
                width: "100%",
                borderRadius: 6,
              }}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Form.Item>
          <div>Description</div>
          <Form.Item
            name="description"
            rules={[
              {
                required: true,
                message: "This field is required!",
              },
            ]}
          >
            <Input
              placeholder="Description"
              name="description"
              style={{
                height: 50,

                borderRadius: 6,
              }}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Category">
            <FormControl sx={{ width: 300 }}>
              <Select placeholder="Select Category..." onChange={loadCate}>
                {cateList.map((cate) => (
                  <Option key={cate.id} value={cate.id}>
                    {cate.nameCatService}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 6,
              span: 16,
            }}
          ></Form.Item>
          <Form.Item
            style={{ marginLeft: 150 }}
            wrapperCol={{
              offset: 6,
              span: 16,
            }}
          >
            <Button
              key="back"
              onClick={handleCancel}
              style={{
                height: 35,
                width: 100,
                borderRadius: 6,
              }}
            >
              Return
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                borderColor: "#0000AA",
                marginLeft: 10,
                height: 35,
                width: 100,
                borderRadius: 6,
                backgroundColor: "#0000AA",
                boxShadow:
                  "0 7px 14px rgb(50 50 93 / 10%), 0 3px 6px rgb(0 0 0 / 8%)",
              }}
              onClick={addService}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <>
        <Modal
          title="Service Update Form"
          visible={isModalUpdateVisible}
          onOk={() => {
            setIsModalUpdateVisible(false);
          }}
          onCancel={() => {
            setIsModalUpdateVisible(false);
          }}
          footer={false}
        >
          {selectedService ? (
            <Form
              name="basic"
              form={formUpdate}
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 40,
              }}
              autoComplete="off"
              onFinish={editService}
            >
              <div>Name Service</div>
              <Form.Item
                name="nameService"
                rules={[
                  {
                    required: true,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input
                  placeholder="Name Service"
                  name="nameService"
                  style={{
                    height: 50,

                    borderRadius: 6,
                  }}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </Form.Item>
              <div>Price</div>
              <Form.Item
                name="price"
                rules={[
                  {
                    required: true,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Price"
                  name="price"
                  style={{
                    height: 50,
                    width: "100%",
                    borderRadius: 6,
                  }}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Item>
              <div>Description</div>
              <Form.Item
                name="description"
                rules={[
                  {
                    required: true,
                    message: "This field is required!",
                  },
                ]}
              >
                <Input
                  placeholder="Description"
                  name="description"
                  style={{
                    height: 50,

                    borderRadius: 6,
                  }}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Category" name='serviceCategoryId'>
                <FormControl sx={{ width: 300 }}>
                  <Select placeholder="Select Category..." onChange={loadCate} disabled>
                    {cateList.map((cate) => (
                      <Option key={cate.id} value={cate.id}>
                        {cate.nameCatService}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 6,
                  span: 16,
                }}
              ></Form.Item>
              <Form.Item
                style={{ marginLeft: 150 }}
                wrapperCol={{
                  offset: 6,
                  span: 16,
                }}
              >
                <Button
                  key="back"
                  onClick={handleCancel}
                  style={{
                    height: 35,
                    width: 100,
                    borderRadius: 6,
                  }}
                >
                  Return
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    borderColor: "#0000AA",
                    marginLeft: 10,
                    height: 35,
                    width: 100,
                    borderRadius: 6,
                    backgroundColor: "#0000AA",
                    boxShadow:
                      "0 7px 14px rgb(50 50 93 / 10%), 0 3px 6px rgb(0 0 0 / 8%)",
                  }}
                >
                  Save
                </Button>
              </Form.Item>
            </Form>
          ) : null}
        </Modal>
      </>
      <Layout className="site-layout">
        <Content
          style={{
            margin: "0 16px",
            boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
            borderRadius: 10,
          }}
        >
          <Breadcrumb
            style={{
              fontWeight: 600,
              fontStyle: "inherit",
              color: "white",
              fontSize: 17,
              marginLeft: 70,
              top: -220,
              position: "relative",
            }}
          >
            <Breadcrumb.Item style={{ fontSize: 22 }}>
              Service Management{" "}
            </Breadcrumb.Item>
            <Breadcrumb.Item>Service</Breadcrumb.Item>
          </Breadcrumb>

          <div
            className="site-layout-background"
            style={{
              padding: 24,
              marginTop: -200,
              borderRadius: 6,
              marginLeft: 50,
            }}
          >
            <div>
              <div style={{}}>
                <div
                  style={{
                    padding: 10,
                    fontStyle: "inherit",
                    fontSize: 50,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    color: "#32325d",
                  }}
                >
                  Service Management
                </div>

                <Button
                  style={{
                    borderColor: "#f7fafc",
                    marginBottom: 30,
                    marginLeft: "80%",
                    height: 45,
                    width: 150,
                    borderRadius: 6,
                    backgroundColor: "#f7fafc",
                    boxShadow:
                      "0 7px 14px rgb(50 50 93 / 10%), 0 3px 6px rgb(0 0 0 / 8%)",
                  }}
                  onClick={showModal}
                >
                  <PlusSquareOutlined />
                  New Service
                </Button>
                <hr color="#F2F2F2" />
                <br />
              

                <FormControl sx={{ m: 1, width: 300 }}>
                  <Select
                    placeholder="Select Category..."
                    onChange={getListServiceByCate}
                  >
                    {cateList.map((cate) => (
                      <Option key={cate.id} value={cate.id}>
                        {cate.nameCatService}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <Table columns={column} dataSource={serviceList} />
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </div>
  );
}
export default ServiceTable;
