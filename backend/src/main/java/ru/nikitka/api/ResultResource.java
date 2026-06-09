package ru.nikitka.api;

import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ru.nikitka.api.dto.ResultCreateRequest;
import ru.nikitka.api.dto.ResultDto;
import ru.nikitka.ejb.ResultService;
import ru.nikitka.ejb.UserService;
import ru.nikitka.model.entity.ResultEntity;
import ru.nikitka.model.entity.UserEntity;
import ru.nikitka.validation.AreaCheckValidator;

import java.util.List;
import java.util.stream.Collectors;

@Path("/results")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ResultResource {

    @Inject
    private ResultService resultService;

    @Inject
    private UserService userService;

    @GET
    public Response list(@Context HttpServletRequest request) {
        UserEntity user = resolveUser(request);
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        List<ResultDto> dto = resultService.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return Response.ok(dto).build();
    }

    @POST
    public Response create(ResultCreateRequest req, @Context HttpServletRequest request) {
        UserEntity user = resolveUser(request);
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (req == null || req.getX() == null || req.getY() == null || req.getR() == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("x, y, r are required").build();
        }

        double x = req.getX();
        double y = req.getY();
        double r = req.getR();

        if (!AreaCheckValidator.isValidRange(x, y, r)) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Validation failed").build();
        }

        ResultEntity saved = resultService.save(x, y, r, user);
        return Response.ok(toDto(saved)).build();
    }

    private ResultDto toDto(ResultEntity entity) {
        return new ResultDto(
                entity.getId(),
                entity.getX(),
                entity.getY(),
                entity.getR(),
                entity.isHit(),
                entity.getCheckTime()
        );
    }

    private UserEntity resolveUser(HttpServletRequest request) {
        Long userId = AuthResource.getUserId(request);
        if (userId == null) return null;
        return userService.findById(userId).orElse(null);
    }
}
