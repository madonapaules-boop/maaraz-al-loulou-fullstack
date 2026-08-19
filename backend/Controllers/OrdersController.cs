using MaarazAlLoulou.Api.DTOs;
using MaarazAlLoulou.Api.Models;
using MaarazAlLoulou.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MaarazAlLoulou.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/orders")]
public sealed class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<OrderResponse>> ListAsync(
        [FromQuery] OrderStatus? status,
        CancellationToken cancellationToken) =>
        orderService.ListAsync(status, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var order = await orderService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(ListAsync), new { id = order.Id }, order);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<OrderResponse>> UpdateAsync(
        int id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var order = await orderService.UpdateAsync(id, request, cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id, CancellationToken cancellationToken) =>
        await orderService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
