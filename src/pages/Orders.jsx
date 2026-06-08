import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus } from '../store/slices/orderSlice';
import toast from 'react-hot-toast';

const STATUS_STYLE = { processing:{bg:'#fef3c7',color:'#92400e'},confirmed:{bg:'#dbeafe',color:'#1e40af'},shipped:{bg:'#ede9fe',color:'#5b21b6'},delivered:{bg:'#dcfce7',color:'#14532d'},cancelled:{bg:'#fee2e2',color:'#991b1b'},refunded:{bg:'#f3f4f6',color:'#374151'} };

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, total, totalPages, loading } = useSelector(s => s.orders);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => { dispatch(fetchAdminOrders({ page, status: statusFilter, limit: 20 })); }, [dispatch, page, statusFilter]);

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, data: { orderStatus } })).unwrap();
      toast.success(`Order status updated to ${orderStatus}`);
    } catch (err) { toast.error(err || 'Update failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Orders</h1><p style={{ color: '#6b7280' }}>{total} total orders</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input" style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            {['processing','confirmed','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(o => {
                const ss = STATUS_STYLE[o.orderStatus] || { bg:'#f3f4f6', color:'#374151' };
                return (
                  <React.Fragment key={o._id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}>
                      <td style={{ fontWeight: 700 }}>{o.orderId}</td>
                      <td><div style={{ fontWeight: 600, fontSize: 13 }}>{o.user?.name}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{o.user?.email}</div></td>
                      <td>{o.items?.length} items</td>
                      <td style={{ fontWeight: 700 }}>₹{o.totalPrice?.toLocaleString()}</td>
                      <td><span className="badge" style={{ background: o.paymentStatus === 'paid' ? '#dcfce7' : '#fef3c7', color: o.paymentStatus === 'paid' ? '#14532d' : '#92400e' }}>{o.paymentStatus}</span></td>
                      <td>
                        <select value={o.orderStatus} onChange={e => { e.stopPropagation(); handleStatusChange(o._id, e.target.value); }} style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, background: ss.bg, color: ss.color, fontWeight: 700, cursor: 'pointer' }}>
                          {['processing','confirmed','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td><span style={{ color: '#f59e0b', fontSize: 12 }}>{expandedOrder === o._id ? '▲' : '▼'} Details</span></td>
                    </tr>
                    {expandedOrder === o._id && (
                      <tr><td colSpan={8}>
                        <div style={{ background: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>📦 Items</div>
                              {o.items?.map((item, i) => <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>{item.name} × {item.quantity} — ₹{(item.price*item.quantity).toLocaleString()}</div>)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>📍 Shipping Address</div>
                              {o.shippingAddress && <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
                                {o.shippingAddress.fullName}<br/>{o.shippingAddress.addressLine1}<br/>{o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}<br/>{o.shippingAddress.phone}
                              </div>}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>💳 Payment</div>
                              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
                                Method: {o.paymentMethod}<br/>
                                Subtotal: ₹{o.itemsPrice?.toLocaleString()}<br/>
                                Discount: -₹{o.discountAmount?.toLocaleString() || 0}<br/>
                                Shipping: ₹{o.shippingPrice?.toLocaleString()}<br/>
                                Tax: ₹{o.taxPrice?.toLocaleString()}<br/>
                                <strong>Total: ₹{o.totalPrice?.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, border: '1px solid', borderColor: page === p ? '#f59e0b' : '#e5e7eb', background: page === p ? '#f59e0b' : '#fff', color: page === p ? '#000' : '#374151', borderRadius: 6, fontWeight: page === p ? 700 : 400, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
