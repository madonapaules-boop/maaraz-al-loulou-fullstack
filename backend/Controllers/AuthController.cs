using MaarazAlLoulou.Api.DTOs;
using MaarazAlLoulou.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MaarazAlLoulou.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthenticationService authenticationService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var login = await authenticationService.LoginAsync(request, cancellationToken);
        return login is null ? Unauthorized(new { error = "بيانات الدخول غير صحيحة." }) : Ok(login);
    }
}
