const sign_in_btn = document.querySelector("#sign-in-btn");
      const sign_up_btn = document.querySelector("#sign-up-btn");
      const container = document.querySelector(".container");

      sign_up_btn.addEventListener("click", () => {
       container.classList.add("sign-up-mode");
      });

      sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
      });





                        $(".remove").click(function () {
                            var id = $(this).parents("tr").attr("id");
                            var baseUrl = $(this).parents("tr").attr("baseurl");
                            swal(
                                {
                                    title: 'Are you sure?',
                                    text: "It will be Delete Now!",
                                    type: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Yes, Delete it!',
                                    showLoaderOnConfirm: true,
                                },
                                function (isConfirm) {
                                    if (isConfirm) {
                                        $.ajax({
                                            url: `${baseUrl}/admin/cat-del?id=${id}`,
                                            headers: { 'X-Requested-With': 'XMLHttpRequest' },
                                            success: function (data) {
                                                console.log('data : ', data);
                                                $("#" + id).remove();
                                                console.log('id', id);
                                                swal("Deleted!", "Your imaginary file has been deleted.", "success");
                                            }
                                        });
                                    } else {
                                        swal("Cancelled", "Your imaginary file is safe :)", "error");
                                    }
                                }
                            );
                        });
                  